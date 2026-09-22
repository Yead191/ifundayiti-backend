import mongoose from 'mongoose';
import Stripe from 'stripe';
import { Event } from '../app/modules/event/event.model';
import { Bookings } from '../app/modules/bookings/bookings.model';
import { Transaction } from '../app/modules/transaction/transaction.model';
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../enums/transaction';
import { NotificationServices } from '../app/modules/notification/notification.service';
import { emailHelper } from '../helpers/emailHelper';
import { emailTemplate } from '../shared/emailTemplate';
import config from '../config';
import { getRandomId } from '../shared/getRandomId';
import QRCode from 'qrcode';

export const handleEventBooking = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const metadata = checkoutSession?.metadata || {};
  const bookingId = metadata?.bookingId;
  const eventId = metadata?.eventId;
  const userId = metadata?.userId;
  const quantity = Math.max(1, parseInt(metadata?.quantity || '1', 10));

  try {
    // 1. Locate booking by ID or session ID
    let booking: any = null;
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Bookings.findById(bookingId);
    }
    if (!booking && checkoutSession.id) {
      booking = await Bookings.findOne({
        stripeSessionId: checkoutSession.id,
      });
    }

    if (!booking) {
      console.error(
        '[Event Booking Webhook] Booking not found for session:',
        checkoutSession.id,
      );
      return;
    }

    // Idempotency check: if already confirmed and paid, do not re-process
    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      console.log(
        '[Event Booking Webhook] Booking already processed:',
        booking._id,
      );
      return;
    }

    // 2. Fetch event
    const event = await Event.findById(eventId || booking.event);
    if (!event) {
      console.error(
        '[Event Booking Webhook] Event not found for booking:',
        booking._id,
      );
      return;
    }

    // 3. Generate unique Ticket Code and QR Code for door staff scanning
    const year = new Date().getFullYear();
    const ticketCode = getRandomId(`IFA-${year}-`, 3, 'uppercase');
    const qrCodeDataUrl = await QRCode.toDataURL(ticketCode, {
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    const paymentTxnId =
      (checkoutSession.payment_intent as string) || checkoutSession.id;
    const amountPaid = checkoutSession.amount_total
      ? checkoutSession.amount_total / 100
      : booking.price;

    // 4. Atomically increment event reserved count
    await Event.findByIdAndUpdate(event._id, {
      $inc: { reservedCount: quantity },
    });

    // 5. Update Booking record
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentIntentId = paymentTxnId;
    booking.ticketCode = ticketCode;
    booking.qrCode = qrCodeDataUrl;
    booking.updatedPrice = amountPaid;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      booking.user = userId;
    }
    await booking.save();

    // 6. Create Transaction record with category: 'Event', type: 'Credit'
    await Transaction.create({
      user:
        booking.user ||
        (userId && mongoose.Types.ObjectId.isValid(userId)
          ? userId
          : undefined),
      total_price: amountPaid,
      payment_received: amountPaid,
      discount_amount: 0,
      discount_percentage: 0,
      status: TRANSACTION_STATUS.SUCCESS,
      type: TRANSACTION_TYPE.CREDIT,
      category: TRANSACTION_CATEGORY.EVENT,
      transaction_id: paymentTxnId,
    });

    // 7. Send In-App Notifications
    if (booking.user) {
      await NotificationServices.createNotification({
        receiver: booking.user,
        title: 'Event Ticket Confirmed',
        message: `Your ticket for "${event.title}" is confirmed! Ticket ID: ${ticketCode}`,
        refId: event._id,
        path: `/dashboard/my-bookings/${event._id}`,
      }).catch(err => console.error('[Notification Error - User]:', err));
    }

    await NotificationServices.sendNotificationToAdmins({
      title: 'New Event Ticket Purchased',
      message: `${booking.customerName} purchased ${quantity} ticket(s) for "${event.title}" ($${amountPaid}).`,
      refId: event._id,
      path: `/admin/events/${event._id}`,
    }).catch(err => console.error('[Notification Error - Admin]:', err));

    // 8. Dispatch Email Confirmation to Attendee
    const ticketDownloadUrl = `${config.backend_url || 'http://10.10.26.173:5004'}/api/v1/booking/ticket/${booking._id}`;

    try {
      const userMailData = emailTemplate.eventBookingUserConfirmation({
        email: booking.customerEmail,
        name: booking.customerName,
        eventTitle: event.title,
        eventCategory: event.category,
        eventType: event.type,
        eventPricingType: 'paid',
        price: amountPaid,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate ? event.endDate.toISOString() : undefined,
        location: event.location,
        venueAddress: event.venueAddress,
        virtualLink: event.virtualLink,
        ticketCode,
        qrCodeDataUrl,
        ticketUrl: ticketDownloadUrl,
        transactionId: paymentTxnId,
        bookingId: booking._id.toString(),
        quantity,
        dressCode: event.dressCode,
      });
      await emailHelper.sendEmail(userMailData);
    } catch (mailErr) {
      console.error('[Attendee Email Error]:', mailErr);
    }

    // 9. Dispatch Admin Notification Email
    try {
      const adminEmail = config.support.admin || config.support.order;
      if (adminEmail) {
        const adminMailData = emailTemplate.eventBookingAdminNotification({
          adminEmail,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          eventTitle: event.title,
          eventType: event.type,
          eventPricingType: 'paid',
          price: amountPaid,
          ticketCode,
          bookingId: booking._id.toString(),
          transactionId: paymentTxnId,
          startDate: event.startDate.toISOString(),
          location: event.location,
          quantity,
        });
        await emailHelper.sendEmail(adminMailData);
      }
    } catch (adminMailErr) {
      console.error('[Admin Email Error]:', adminMailErr);
    }

    console.log(
      `[Event Booking Webhook] Successfully completed for booking ${booking._id}, ticket ${ticketCode}`,
    );
  } catch (error) {
    console.error('[Event Booking Webhook Processing Error]:', error);
  }
};

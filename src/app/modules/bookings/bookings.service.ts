import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { Bookings } from './bookings.model';
import { IBookings } from './bookings.interface';
import { Event } from '../event/event.model';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import stripe from '../../../config/stripe';
import { StatusCodes } from 'http-status-codes';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { getRandomId } from '../../../shared/getRandomId';
import QRCode from 'qrcode';
import { generateEventTicketHtml } from '../../../templates/ticketTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { NotificationServices } from '../notification/notification.service';

/**
 * Books an event ticket (handles both FREE immediate confirmation and PAID Stripe checkout)
 */
const bookEventIntoDB = async (
  user: JwtPayload,
  payload: {
    event: string;
    customerPhone?: string;
    quantity?: number;
    note?: string;
  },
) => {
  if (!user || !user.id) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'You must be logged in to register or book an event',
    );
  }

  const eventId = payload.event;
  const quantity = Math.max(1, payload.quantity || 1);

  // 1. Fetch and validate event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  if (event.status !== 'published') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot book ticket. Event is currently ${event.status}.`,
    );
  }

  // Check seat availability
  if (event.capacity && event.capacity > 0) {
    const remainingSeats = Math.max(0, event.capacity - event.reservedCount);
    if (remainingSeats < quantity) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Not enough seats available. Only ${remainingSeats} seat(s) remaining.`,
      );
    }
  }

  // 2. Resolve attendee info strictly from JWT authorized user
  const userDoc = await User.findById(user.id);
  if (!userDoc) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User account not found');
  }

  const customerName = userDoc.name || 'Valued Attendee';
  const customerEmail = userDoc.email;
  const customerPhone = payload.customerPhone || userDoc.phone || '';

  if (!customerEmail) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User email is missing. Please update your profile.',
    );
  }

  const isFree =
    event.pricingType === 'free' ||
    event.type === 'virtual' ||
    !event.price ||
    event.price <= 0;

  const totalAmount = isFree ? 0 : Number(event.price) * quantity;

  // 3. Handle FREE Event Registration
  if (isFree) {
    let ticketCode: string | undefined;

    const isPhysicalOrHybrid =
      event.type === 'physical' || event.type === 'hybrid';

    if (isPhysicalOrHybrid) {
      const year = new Date().getFullYear();
      ticketCode = getRandomId(`IFA-${year}-`, 3, 'uppercase');
    }

    // Atomically increment reserved count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { reservedCount: quantity },
    });

    const booking = await Bookings.create({
      event: event._id,
      user: userDoc._id,
      customerName,
      customerEmail,
      customerPhone,
      quantity,
      price: 0,
      updatedPrice: 0,
      ticketCode,
      checkedIn: false,
      status: 'confirmed',
      paymentStatus: 'free',
      note: payload.note || '',
    });

    const ticketDownloadUrl = ticketCode
      ? `${config.backend_url || 'http://10.10.26.173:5004'}/api/v1/booking/ticket/${booking._id}`
      : undefined;

    let qrCodeDataUrl: string | undefined;
    if (ticketCode) {
      qrCodeDataUrl = await QRCode.toDataURL(ticketCode, {
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      await Bookings.findByIdAndUpdate(booking._id, { qrCode: qrCodeDataUrl });
    }

    // In-app notifications
    if (userDoc?._id) {
      await NotificationServices.createNotification({
        receiver: userDoc._id,
        title: 'Event Spot Reserved',
        message: `Your reservation for "${event.title}" is confirmed!`,
        refId: event._id,
        path: `/event/${event._id}`,
      }).catch(err => console.error('[Event Notification Error]:', err));
    }

    await NotificationServices.sendNotificationToAdmins({
      title: 'New Free Event RSVP',
      message: `${customerName} reserved ${quantity} spot(s) for "${event.title}".`,
      refId: event._id,
      path: `/admin/events/${event._id}`,
    }).catch(err => console.error('[Admin Notification Error]:', err));

    // Send confirmation emails to Attendee and Admin

    try {
      const userMailData = emailTemplate.eventBookingUserConfirmation({
        email: customerEmail,
        name: customerName,
        eventTitle: event.title,
        eventCategory: event.category,
        eventType: event.type,
        eventPricingType: 'free',
        price: 0,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate ? event.endDate.toISOString() : undefined,
        location: event.location,
        venueAddress: event.venueAddress,
        virtualLink: event.virtualLink,
        ticketCode,
        qrCodeDataUrl,
        ticketUrl: ticketDownloadUrl,
        bookingId: booking._id.toString(),
        quantity,
        dressCode: event.dressCode,
      });
      await emailHelper.sendEmail(userMailData);
    } catch (mailErr) {
      console.error('[Attendee Email Error]:', mailErr);
    }

    try {
      const adminEmail = config.support.admin || config.support.order;
      if (adminEmail) {
        const adminMailData = emailTemplate.eventBookingAdminNotification({
          adminEmail,
          customerName,
          customerEmail,
          customerPhone,
          eventTitle: event.title,
          eventType: event.type,
          eventPricingType: 'free',
          price: 0,
          ticketCode,
          bookingId: booking._id.toString(),
          startDate: event.startDate.toISOString(),
          location: event.location,
          quantity,
        });
        await emailHelper.sendEmail(adminMailData);
      }
    } catch (adminMailErr) {
      console.error('[Admin Email Error]:', adminMailErr);
    }

    return {
      booking,
      isPaid: false,
      ticketCode,
      message: 'Spot reserved successfully!',
    };
  }

  // 4. Handle PAID Event Registration (Physical / Hybrid)
  const booking = await Bookings.create({
    event: event._id,
    user: userDoc._id,
    customerName,
    customerEmail,
    customerPhone,
    quantity,
    price: totalAmount,
    updatedPrice: totalAmount,
    status: 'pending',
    paymentStatus: 'pending',
    note: payload.note || '',
  });

  const isValidAbsoluteUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const productImages = isValidAbsoluteUrl(event.image)
    ? [event.image as string]
    : [];

  const frontendBase = config.frontend_url || 'http://localhost:3000';

  const line_items = [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${event.title} - Admission Ticket`,
          description: `${quantity}x Ticket(s) for ${customerName}`,
          ...(productImages.length > 0 ? { images: productImages } : {}),
        },
        unit_amount: Math.round(Number(event.price) * 100),
      },
      quantity,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    customer_email: customerEmail,
    success_url: `${frontendBase}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=event`,
    cancel_url: `${frontendBase}/payment/failed?type=event`,

    metadata: {
      type: 'event',
      bookingId: booking._id.toString(),
      eventId: event._id.toString(),
      userId: userDoc._id.toString(),
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      quantity: quantity.toString(),
    },
  });

  if (!session.url) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create Stripe Checkout session',
    );
  }

  // Link session ID to booking
  await Bookings.findByIdAndUpdate(booking._id, {
    stripeSessionId: session.id,
  });

  return {
    booking,
    isPaid: true,
    checkoutUrl: session.url,
  };
};

/**
 * Scans and checks in an attendee by ticket code or scanned ticket URL
 */
const checkInTicket = async (ticketCodeOrUrl: string) => {
  if (!ticketCodeOrUrl) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Ticket code or scanned URL is required',
    );
  }

  let cleanInput = ticketCodeOrUrl.trim();
  if (cleanInput.includes('/')) {
    const parts = cleanInput.split('/');
    cleanInput = parts[parts.length - 1];
  }

  const query = mongoose.Types.ObjectId.isValid(cleanInput)
    ? { _id: cleanInput }
    : { ticketCode: cleanInput.toUpperCase() };

  const booking = await Bookings.findOne(query)
    .populate('event', 'title startDate endDate location venueAddress type')
    .populate('user', 'name email');

  if (!booking) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Ticket "${cleanInput}" was not found in our records.`,
    );
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This booking has been cancelled and ticket is void.',
    );
  }

  if (booking.paymentStatus !== 'paid' && booking.paymentStatus !== 'free') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Ticket payment status is "${booking.paymentStatus}". Check-in denied.`,
    );
  }

  if (booking.checkedIn) {
    return {
      alreadyCheckedIn: true,
      message: `Already checked in on ${booking.checkedInAt?.toLocaleString() || 'earlier today'}.`,
      booking,
    };
  }

  const updatedBooking = await Bookings.findByIdAndUpdate(
    booking._id,
    {
      checkedIn: true,
      checkedInAt: new Date(),
      status: 'attended',
    },
    { new: true },
  )
    .populate('event', 'title startDate endDate location venueAddress')
    .populate('user', 'name email');

  return {
    alreadyCheckedIn: false,
    message: 'Check-in successful! Welcome to the event.',
    booking: updatedBooking,
  };
};

/**
 * Returns raw HTML and CSS for viewing, printing, or downloading the ticket
 */
const renderTicketHtml = async (idOrCode: string): Promise<string> => {
  let cleanInput = idOrCode.trim();
  if (cleanInput.includes('/')) {
    const parts = cleanInput.split('/');
    cleanInput = parts[parts.length - 1];
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(cleanInput);
  const query = isObjectId
    ? { $or: [{ _id: cleanInput }, { ticketCode: cleanInput.toUpperCase() }] }
    : { ticketCode: cleanInput.toUpperCase() };

  const booking = await Bookings.findOne(query).populate('event');
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking ticket not found');
  }

  const event: any = booking.event;
  if (!event) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Associated event not found for this ticket',
    );
  }

  const ticketUrl = `${config.backend_url || 'http://10.10.26.173:5004'}/api/v1/booking/ticket/${booking._id}`;

  // If QR code is not stored, generate it from ticketCode
  let qrCode = booking.qrCode;
  if (!qrCode && booking.ticketCode) {
    qrCode = await QRCode.toDataURL(booking.ticketCode, {
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
    await Bookings.findByIdAndUpdate(booking._id, { qrCode });
  }

  const eventDate = event.startDate ? new Date(event.startDate) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return generateEventTicketHtml({
    eventTitle: event.title,
    eventSubtitle: event.category
      ? event.category.toUpperCase()
      : 'FOR A BRIGHTER HAITI',
    category: event.category,
    formattedDate,
    formattedTime,
    location: event.location || 'Venue details provided',
    venueAddress: event.venueAddress || '',
    dressCode: event.dressCode || 'Formal Attire',
    ticketType:
      event.pricingType === 'free' ? 'Complimentary RSVP' : 'General Admission',
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    ticketCode:
      booking.ticketCode ||
      `IFA-${booking._id.toString().slice(-6).toUpperCase()}`,
    ticketUrl,
    qrCodeDataUrl: qrCode,
    quantity: booking.quantity || 1,
    price: booking.price,
    unitPrice: event.price || 0,
    pricingType: event.pricingType || (booking.price > 0 ? 'paid' : 'free'),
  });
};

/**
 * Get all bookings with filtering, pagination, and role-based scoping
 */
const getAllBookings = async (user: JwtPayload, query: Record<string, any>) => {
  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  );

  const initQuery: Record<string, any> = {
    paymentStatus: { $in: ['paid', 'free'] },
  };

  if (!isAdmin) {
    // Non-admin can only see their own bookings
    initQuery.$or = [{ user: user.id }, { customerEmail: user.email }];
  }

  if (query.event) {
    initQuery.event = query.event;
  }
  if (query.status) {
    initQuery.status = query.status;
  }
  if (query.paymentStatus) {
    initQuery.paymentStatus = query.paymentStatus;
  }
  if (query.checkedIn !== undefined) {
    initQuery.checkedIn = query.checkedIn === 'true';
  }

  const qb = new QueryBuilder(
    Bookings.find(initQuery)
      .populate('user', 'name email image')
      .populate(
        'event',
        'title type category startDate endDate location venueAddress price image dressCode',
      )
      .populate('service', 'title price'),
    query,
  )
    .search([
      'customerName',
      'customerEmail',
      'customerPhone',
      'ticketCode',
      'paymentIntentId',
    ])
    .filter(['event', 'status', 'paymentStatus', 'checkedIn'])
    .paginate()
    .sort()
    .fields();

  const [bookings, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { bookings, pagination };
};

/**
 * Get single booking by ID
 */
const getBookingById = async (id: string, user: JwtPayload) => {
  const booking = await Bookings.findById(id)
    .populate('user', 'name email image')
    .populate('event')
    .populate('service');

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user.role,
  );
  if (
    !isAdmin &&
    booking.user?.toString() !== user.id &&
    booking.customerEmail !== user.email
  ) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied to this booking');
  }

  // Ensure QR code is present if ticketCode exists
  if (!booking.qrCode && booking.ticketCode) {
    const qrCode = await QRCode.toDataURL(booking.ticketCode, {
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });
    booking.qrCode = qrCode;
    await Bookings.findByIdAndUpdate(booking._id, { qrCode });
  }

  return booking;
};

/**
 * Updates booking status (e.g. admin marking as completed or cancelled)
 */
const updateBookingStatus = async (id: string, payload: { status: string }) => {
  const booking = await Bookings.findById(id);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // If cancelling a confirmed booking, release event seats
  if (
    payload.status === 'cancelled' &&
    booking.status === 'confirmed' &&
    booking.event
  ) {
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { reservedCount: -Math.abs(booking.quantity || 1) },
    });
  }

  const result = await Bookings.findByIdAndUpdate(
    id,
    { $set: { status: payload.status } },
    { new: true },
  );

  return result;
};

/**
 * Delete a booking
 */
const deleteBooking = async (id: string) => {
  const booking = await Bookings.findById(id);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // If confirmed, release seats
  if (booking.status === 'confirmed' && booking.event) {
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { reservedCount: -Math.abs(booking.quantity || 1) },
    });
  }

  const result = await Bookings.findByIdAndDelete(id);
  return result;
};

export const BookingsServices = {
  bookEventIntoDB,
  checkInTicket,
  renderTicketHtml,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};

import { Schema, model } from 'mongoose';
import { IBookings, BookingsModel } from './bookings.interface';

const bookingsSchema = new Schema<IBookings, BookingsModel>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
      index: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Services',
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    // Attendee details
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: false,
      trim: true,
    },

    // Ticket & Check-in
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    qrCode: {
      type: String,
      required: false,
    },
    checkedIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkedInAt: {
      type: Date,
      required: false,
    },

    // Quantity & Pricing
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedPrice: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },

    // Statuses
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'attended'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'free', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentIntentId: {
      type: String,
      required: false,
    },
    stripeSessionId: {
      type: String,
      required: false,
    },

    preferredDate: {
      type: Date,
      required: false,
    },
    preferredTime: {
      type: String,
      required: false,
    },
    note: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Bookings = model<IBookings, BookingsModel>(
  'Bookings',
  bookingsSchema,
);

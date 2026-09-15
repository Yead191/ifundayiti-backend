import { Schema, model } from 'mongoose';
import { EventModel, IEvent } from './event.interface';

const speakerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const eventSchema = new Schema<IEvent, EventModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['fundraiser', 'pitch-night', 'workshop', 'gala'],
      required: true,
    },
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      required: true,
    },
    pricingType: {
      type: String,
      enum: ['free', 'paid'],
      required: true,
      default: 'free',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    venueAddress: {
      type: String,
      trim: true,
      default: '',
    },
    virtualLink: {
      type: String,
      trim: true,
      default: '',
    },
    dressCode: {
      type: String,
      trim: true,
      default: 'Formal Attire',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      default: null,
      min: 0,
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    speakers: {
      type: [speakerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field for remainingSeats
eventSchema.virtual('remainingSeats').get(function (this: IEvent) {
  if (this.capacity === undefined || this.capacity === null) {
    return null;
  }
  return Math.max(0, this.capacity - (this.reservedCount || 0));
});

// Performance indexes for search and filtering
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ pricingType: 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ createdAt: -1 });

export const Event = model<IEvent, EventModel>('Event', eventSchema);

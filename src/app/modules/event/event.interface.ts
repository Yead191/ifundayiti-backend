import { Model, Types } from 'mongoose';

export type EventCategory =
  | 'fundraiser'
  | 'pitch-night'
  | 'workshop'
  | 'gala';

export type EventType =
  | 'physical'
  | 'virtual'
  | 'hybrid';

export type EventPricingType =
  | 'free'
  | 'paid';

export interface EventSpeaker {
  name: string;
  role: string;
  avatar?: string;
}

export interface IEvent {
  title: string;
  description: string;
  category: EventCategory;
  type: EventType;
  pricingType: EventPricingType;
  startDate: Date;
  endDate: Date;
  location?: string;
  venueAddress?: string;
  virtualLink?: string;
  dressCode?: string;
  price?: number;
  capacity?: number;
  reservedCount: number;
  remainingSeats?: number;
  image?: string;
  featured: boolean;
  speakers?: EventSpeaker[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EventModel = Model<IEvent>;

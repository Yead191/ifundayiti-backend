import { Schema, model } from 'mongoose';
import { IDigital, DigitalModel } from './digital.interface';

const digitalSchema = new Schema<IDigital, DigitalModel>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: String,
  },
  { timestamps: true },
);

export const Digital = model<IDigital, DigitalModel>('Digital', digitalSchema);

import { Schema, model } from 'mongoose';
import { IPartner, PARTNER_STATUS, PartnerModel } from './partner.interface';

const partnerSchema = new Schema<IPartner, PartnerModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    offers: {
      type: [String],
      required: true,
      default: [],
    },

    website: {
      type: String,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(PARTNER_STATUS),
      default: PARTNER_STATUS.PENDING,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Partner = model<IPartner, PartnerModel>('Partner', partnerSchema);

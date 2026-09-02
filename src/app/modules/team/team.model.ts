import { Schema, model } from 'mongoose';
import { ITeam, TeamModel } from './team.interface';

const teamSchema = new Schema<ITeam, TeamModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },

    category: {
      type: String,
      enum: ['director', 'member', 'volunteer'],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'blocked'],
      required: true,
      default: 'pending',
    },
    focusAreas: {
      type: [String],
      required: false,
      default: [],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },

    twitter: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

export const Team = model<ITeam, TeamModel>('Team', teamSchema);

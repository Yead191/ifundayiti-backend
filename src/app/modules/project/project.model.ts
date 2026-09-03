import { Schema, model } from 'mongoose';
import { IProject, ProjectModel } from './project.interface';
import { PROJECT_STATUS, PROJECT_CATEGORIES } from './project.constants';

const projectSchema = new Schema<IProject, ProjectModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    grantAmount: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.DRAFT,
    },

    category: {
      type: String,
      enum: PROJECT_CATEGORIES,
      required: true,
      trim: true,
    },

    founder: {
      type: String,
      trim: true,
      default: '',
    },

    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },

    image: {
      type: String,
      default: '',
    },

    applicationPeriod: {
      type: Schema.Types.ObjectId,
      ref: 'Applicationperiod',
      default: null,
    },

    challenge: {
      type: String,
      trim: true,
      default: '',
    },

    approach: {
      type: String,
      trim: true,
      default: '',
    },

    outcome: {
      type: String,
      trim: true,
      default: '',
    },

    story: {
      type: String,
      trim: true,
      default: '',
    },

    gallery: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Project = model<IProject, ProjectModel>('Project', projectSchema);

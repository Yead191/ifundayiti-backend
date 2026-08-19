import { Schema, model } from 'mongoose';
import { IApplicationperiod, ApplicationperiodModel } from './applicationperiod.interface';

const applicationperiodSchema = new Schema<IApplicationperiod, ApplicationperiodModel>({

  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },

  maximumGrantAmount: {
    type: Number,
    required: true,
    min: 1, max: 1000
  },
  totalApplicationsSubmitted: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'Upcoming',
      'Open',
      'Review',
      'WinnerSelection',
      'Closed',
    ],
    default: 'Upcoming',
  },

}, {
  timestamps: true,
}
);

applicationperiodSchema.index({
  status: 1,
})

export const Applicationperiod = model<IApplicationperiod, ApplicationperiodModel>('Applicationperiod', applicationperiodSchema);

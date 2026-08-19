import { Model } from 'mongoose';

export type TApplicationPeriodStatus =
  | 'Upcoming'
  | 'Open'
  | 'Review'
  | 'WinnerSelection'
  | 'Closed';

export type IApplicationperiod = {
  title: string;

  startDate: Date;

  endDate: Date;

  maximumGrantAmount: number;

  status: TApplicationPeriodStatus;
  totalApplicationsSubmitted?: number
};

export type ApplicationperiodModel = Model<IApplicationperiod>;

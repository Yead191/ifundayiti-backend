import { Applicationperiod } from './applicationperiod.model';

export const syncApplicationPeriodStatuses = async () => {
  const now = new Date();

  // Upcoming → Open
  await Applicationperiod.updateMany(
    {
      status: 'Upcoming',
      startDate: { $lte: now },
      endDate: { $gte: now },
    },
    {
      $set: { status: 'Open' },
    },
  );

  // Open → Review
  await Applicationperiod.updateMany(
    {
      status: 'Open',
      endDate: { $lt: now },
    },
    {
      $set: { status: 'Review' },
    },
  );
};

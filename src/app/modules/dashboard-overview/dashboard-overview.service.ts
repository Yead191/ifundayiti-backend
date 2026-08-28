import { Application } from '../iFundAyiti/application/application.model';

const getDashboardOverview = async () => {
  const [
    totalApplication,
    submitted,
    underReview,
    approved,
    rejected,
    finalist,
    winner,
    archived,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ status: 'submitted' }),
    Application.countDocuments({ status: 'underReview' }),
    Application.countDocuments({ status: 'approved' }),
    Application.countDocuments({ status: 'rejected' }),
    Application.countDocuments({ status: 'finalist' }),
    Application.countDocuments({ status: 'winner' }),
    Application.countDocuments({ status: 'archived' }),
  ]);

  return {
    totalApplication,
    submitted,
    underReview,
    approved,
    rejected,
    finalist,
    winner,
    archived,
  };
};

export const DashboardOverviewServices = {
  getDashboardOverview,
};

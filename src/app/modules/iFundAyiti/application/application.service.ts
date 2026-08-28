import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { Applicationperiod } from '../applicationperiod/applicationperiod.model';
import { IApplication, TApplicationStatus } from './application.interface';
import { Application } from './application.model';
import unlinkFile from '../../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../../builder/QueryBuilder';
import mongoose from 'mongoose';
import {
  APPLICATION_STATUS,
  STATUS_TRANSITIONS,
} from './application.constants';
import { emailHelper } from '../../../../helpers/emailHelper';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { ProgramFund } from '../programFund/programFund.model';
import { Donation } from '../donation/donation.model';
import { NotificationServices } from '../../notification/notification.service';
import { USER_ROLES } from '../../../../enums/user';

const createApplicationToDB = async (payload: IApplication) => {
  try {
    const currentPeriod = await Applicationperiod.findOne({ status: 'Open' });
    if (!currentPeriod) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No application period is currently open.',
      );
    }

    if (new Date() > currentPeriod.endDate) {
      currentPeriod.status = 'Review';
      await currentPeriod.save();
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Application period has ended.',
      );
    }

    const existingApplication = await Application.findOne({
      'contact.email': payload.contact.email,
      'personal.dob': payload.personal.dob,
      applicationPeriod: currentPeriod._id,
    });

    if (existingApplication) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You have already submitted an application for this period.',
      );
    }

    payload.applicationPeriod = currentPeriod._id;

    const result = await Application.create(payload);

    try {
      const emailData = emailTemplate.applicationSubmissionConfirmation({
        email: result.contact.email,
        name: result.personal.name,
        projectName: result.grant.projectName,
      });
      emailHelper.sendEmail(emailData);

      NotificationServices.sendNotificationToAdmins({
        title: 'New Application Submitted',
        message: `${result.personal.name} has submitted a new application for "${result.grant.projectName}"`,
        refId: result._id,
        path: '/applications',
      });
    } catch (error) {
      console.error('Failed to send submission email or notification:', error);
    }

    return result;
  } catch (error) {
    const docs = payload.documents ?? [];

    if (payload.personal.image) {
      unlinkFile(payload.personal.image);
    }
    for (const doc of docs) {
      if (doc.url) {
        unlinkFile(doc.url);
      }
    }
    console.error('Failed to create application:', error);
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      error instanceof Error ? error.message : 'Failed to create application',
    );
  }
};

// get all applications
const getAllApplicationsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? {}
    : {
        status: {
          $in: [APPLICATION_STATUS.WINNER, APPLICATION_STATUS.FINALIST],
        },
      };

  const qb = new QueryBuilder(
    Application.find(initQuery).select(
      'personal contact grant status createdAt applicationPeriod projectGallery awardedAmount successStory background quote',
    ),
    query,
  )
    .search(['personal.name', 'contact.email', 'identification.nationalId'])
    .filter()
    .paginate()
    .sort()
    .populate(['applicationPeriod'], {
      applicationPeriod: 'title startDate endDate',
    });

  const [applications, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return { applications, pagination };
};

// get single application

const getSingleApplicationFromDB = async (user: JwtPayload, id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid application id');
  }

  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  );

  let applicationQuery = Application.findOne({ _id: id })
    .populate('applicationPeriod', 'title startDate endDate')
    .populate('reviewedBy', 'name email role');

  if (!isAdmin) {
    applicationQuery = applicationQuery.select(
      'personal contact grant status createdAt applicationPeriod projectGallery awardedAmount successStory background quote',
    );
  }

  const application = await applicationQuery.lean();
  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application not found');
  }
  return application;
};

// track application
const trackApplicationFromDB = async (email: string, dob: string, periodId?: string) => {
  if (!email || !dob) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Email and Birthdate is required',
    );
  }

  let query: Record<string, any> = {
    'contact.email': email,
    'personal.dob': new Date(dob),
  };

  if (periodId) {
    query.applicationPeriod = periodId;
  }

  const application = await Application.findOne(query)
    .sort({ createdAt: -1 })
    .populate('applicationPeriod', 'title startDate endDate')
    .lean();

  if (!application) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Application not found. Please check your email and birthdate.',
    );
  }
  return application;
};

// UPDATE APPLICATION STATUS
const updateApplicationStatusToDB = async (
  id: string,
  payload: { status: TApplicationStatus; rejectionReason?: string },
  admin: JwtPayload,
) => {
  const application = await Application.findById(id);
  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application not found');
  }
  const allowed = STATUS_TRANSITIONS[
    application.status
  ] as readonly TApplicationStatus[];

  if (!allowed.includes(payload.status)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot change status from ${application.status} to ${payload.status}`,
    );
  }

  application.status = payload.status;
  application.reviewedBy = admin.id;
  application.reviewedAt = new Date();

  if (payload.status === APPLICATION_STATUS.REJECTED) {
    if (!payload.rejectionReason || payload.rejectionReason.trim() === '') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Rejection reason is required',
      );
    }
    application.rejectionReason = payload.rejectionReason;
  }
  if (payload.status === APPLICATION_STATUS.FINALIST) {
    // close application period
    await Applicationperiod.updateOne(
      { _id: application.applicationPeriod },
      { $set: { status: 'WinnerSelection' } },
    );
  }
  if (payload.status === APPLICATION_STATUS.WINNER) {
    // close application period
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Winner selection will be done through winner selection process',
    );
  }

  await application.save();

  // Send email notification on status update
  try {
    const emailData = emailTemplate.applicationStatusUpdate({
      email: application.contact.email,
      name: application.personal.name,
      projectName: application.grant.projectName,
      status: application.status,
      rejectionReason: application.rejectionReason,
    });
    emailHelper.sendEmail(emailData);
  } catch (error) {
    console.error('Failed to send status update email:', error);
  }

  return application;
};

// winner selection
const winnerSelection = async (
  id: string,
  payload: { successStory: string; awardedAmount: number },
  admin: JwtPayload,
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid application id');
  }
  const application = await Application.findById(id);
  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application not found');
  }
  // check fund amount
  const totalFundAmount = await ProgramFund.findOne({});
  if (!totalFundAmount || totalFundAmount.amount <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No fund available');
  }
  if (payload.awardedAmount > totalFundAmount.amount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Total fund is not enough for this application',
    );
  }

  //check if application is eligible for winner selection
  const allowed = STATUS_TRANSITIONS[
    application.status
  ] as readonly TApplicationStatus[];
  if (!allowed.includes('winner')) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot change status from ${application.status} to "winner"`,
    );
  }
  const isWinnerExist = await Application.findOne({
    status: 'winner',
    applicationPeriod: application.applicationPeriod,
  });
  if (isWinnerExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Winner already exists');
  }
  //check if awardedAmount is valid
  if (!payload.awardedAmount || payload.awardedAmount <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Funded amount is required');
  }

  if (payload.awardedAmount > application.grant.requestedAmount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Awarded amount cannot exceed the requested amount. Applicant requested ${application.grant.requestedAmount} and you are trying to award ${payload.awardedAmount}`,
    );
  }
  //check if successStory is valid
  if (!payload.successStory || payload.successStory.trim() === '') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Success story is required');
  }
  //update application status to winner
  application.status = 'winner';
  application.awardedAmount = payload.awardedAmount;
  application.successStory = payload.successStory;
  application.reviewedBy = admin.id;
  application.reviewedAt = new Date();

  // Track transaction in ProgramFun

  const trackFund = await Donation.create({
    name: admin.name || 'Admin',
    email: admin.email,
    type: 'grant',
    amount: payload.awardedAmount,
    applicant: application._id,
  });

  if (!trackFund) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to track fund',
    );
  }
  await ProgramFund.updateOne(
    {},
    {
      $inc: { amount: -payload.awardedAmount },
    },
  );
  await application.save();

  //close application period
  await Applicationperiod.updateOne(
    { _id: application.applicationPeriod },
    { $set: { status: 'Closed' } },
  );
  //send email notification to winner
  try {
    const emailData = emailTemplate.applicationStatusUpdate({
      email: application.contact.email,
      name: application.personal.name,
      projectName: application.grant.projectName,
      status: application.status,
      rejectionReason: application.rejectionReason,
    });
    emailHelper.sendEmail(emailData);
    NotificationServices.sendNotificationToAdmins({
      title: 'Winner Selected',
      message: `${admin.name} selected ${application.personal.name} as winner`,
      refId: application._id,
      path: '/transactions',
    });
  } catch (error) {
    console.error('Failed to send status update email:', error);
  }
  return application;
};

// delete Application
const deleteApplicationFromDB = async (id: string) => {
  const application = await Application.findById(id);
  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application not found');
  }

  const docs = application.documents || [];
  for (const doc of docs) {
    if (doc.url) {
      unlinkFile(doc.url);
    }
  }
  if (application.personal.image) {
    unlinkFile(application.personal.image);
  }
  if (application.projectGallery) {
    for (const gallery of application.projectGallery) {
      if (gallery) {
        unlinkFile(gallery);
      }
    }
  }
  const result = await Application.deleteOne({ _id: id });
  return result;
};

//DASHBOARD
const getStatisticsFromDB = async () => {
  // status stats
  const statusStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
  ]);

  const total = await Application.countDocuments();
  return {
    total,
    statusStats,
  };
};

const getMonthlyApplicationChartFromDB = async (year?: string) => {
  // monthly application chart by year
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthlyData = months.map(m => ({ month: m, count: 0 }));

  const yearNum = year ? Number(year) : new Date().getFullYear();
  const startDate = new Date(`${yearNum}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${yearNum}-12-31T23:59:59.999Z`);

  const monthlyStats = await Application.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        monthIndex: '$_id',
        count: 1,
      },
    },
  ]);

  monthlyStats.forEach(stat => {
    const idx = stat.monthIndex - 1;
    if (idx >= 0 && idx < 12) {
      monthlyData[idx].count = stat.count;
    }
  });

  return monthlyData;
};

const getDonationAmountChartFromDB = async (year?: string) => {
  // monthly requested grant amount chart by year
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthlyData = months.map(m => ({ month: m, amount: 0 }));

  const yearNum = year ? Number(year) : new Date().getFullYear();
  const startDate = new Date(`${yearNum}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${yearNum}-12-31T23:59:59.999Z`);

  const monthlyStats = await Donation.aggregate([
    {
      $match: {
        type: 'donation',
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        monthIndex: '$_id',
        totalAmount: 1,
      },
    },
  ]);

  monthlyStats.forEach(stat => {
    const idx = stat.monthIndex - 1;
    if (idx >= 0 && idx < 12) {
      monthlyData[idx].amount = stat.totalAmount;
    }
  });

  return monthlyData;
};

const getApplicationStatusStatsFromDB = async () => {
  const statusMapping: Record<string, string> = {
    submitted: 'Submitted',
    underReview: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    finalist: 'Finalist',
    winner: 'Winner',
    archived: 'Archived',
  };

  const stats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return stats.map(stat => ({
    status: statusMapping[stat._id] || stat._id,
    count: stat.count,
  }));
};

// recent application

const getRecentApplicationsFromDB = async () => {
  const applications = await Application.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('applicationPeriod', 'title startDate endDate')
    .select('personal.name personal.image grant.projectName status createdAt');
  return applications;
};

export const ApplicationServices = {
  getStatisticsFromDB,
  getMonthlyApplicationChartFromDB,
  getDonationAmountChartFromDB,
  getApplicationStatusStatsFromDB,
  createApplicationToDB,
  getAllApplicationsFromDB,
  getSingleApplicationFromDB,
  trackApplicationFromDB,
  updateApplicationStatusToDB,
  getRecentApplicationsFromDB,
  winnerSelection,
  deleteApplicationFromDB,
};

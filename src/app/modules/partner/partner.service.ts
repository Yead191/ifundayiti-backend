import { JwtPayload } from 'jsonwebtoken';
import { IPartner, PARTNER_STATUS } from './partner.interface';
import { Partner } from './partner.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import { NotificationServices } from '../notification/notification.service';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import config from '../../../config';
import { partnerSearchableFields } from './partner.constants';
import { logger } from '../../../shared/logger';

const applyPartnerToDB = async (
  userId: string,
  payload: IPartner,
): Promise<IPartner> => {
  try {
    const isAlreadyApplied = await Partner.findOne({ user: userId });
    if (isAlreadyApplied) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You have already submitted a partner application.',
      );
    }

    payload.user = userId as any;
    payload.status = PARTNER_STATUS.PENDING;
    payload.featured = false;

    const result = await Partner.create(payload);
    const userDoc = await User.findById(userId);

    // 1. In-App Notification to Applicant
    try {
      await NotificationServices.createNotification({
        receiver: userId as any,
        title: 'Partner Application Submitted',
        message: `Your partner application for "${result.name}" has been submitted and is currently under review.`,
        refId: result._id,
        path: '/partners',
      });
    } catch (notifErr) {
      logger.error(
        'Error sending partner application user notification:',
        notifErr,
      );
    }

    // 2. In-App Notification to Admins
    try {
      await NotificationServices.sendNotificationToAdmins({
        title: 'New Partner Application',
        message: `New partner application received for "${result.name}" by ${userDoc?.name || 'User'}.`,
        refId: result._id,
        path: '/partners',
      });
    } catch (notifErr) {
      logger.error(
        'Error sending partner application admin notification:',
        notifErr,
      );
    }

    // 3. Confirmation Email to Applicant
    const userEmail = userDoc?.email || payload.contactEmail;
    if (userEmail) {
      try {
        const emailData = emailTemplate.partnerApplicationUserConfirmation({
          email: userEmail,
          name: userDoc?.name || payload.name,
          partnerName: result.name,
        });
        await emailHelper.sendEmail(emailData);
      } catch (emailErr) {
        logger.error('Error sending partner application user email:', emailErr);
      }
    }

    // 4. Admin Email Notification (config.support.admin)
    const adminEmail = (config.support.admin as string) || (config.email.from as string);
    if (adminEmail) {
      try {
        const adminEmailData =
          emailTemplate.partnerApplicationAdminNotification({
            adminEmail: adminEmail,
            applicantName: userDoc?.name || payload.name,
            applicantEmail: userDoc?.email || payload.contactEmail || 'N/A',
            partnerName: result.name,
            contactEmail: payload.contactEmail,
            contactPhone: payload.contactPhone,
            website: payload.website,
            offers: result.offers || payload.offers,
          });
        await emailHelper.sendEmail(adminEmailData);
      } catch (emailErr) {
        logger.error(
          'Error sending partner application admin email:',
          emailErr,
        );
      }
    }

    return result;
  } catch (err) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      (err as Error).message || 'Failed to apply for partner',
    );
  }
};

const createPartnerToDB = async (payload: IPartner): Promise<IPartner> => {
  if (!payload.status) {
    payload.status = PARTNER_STATUS.PENDING;
  }
  if (payload.featured === undefined) {
    payload.featured = false;
  }
  const result = await Partner.create(payload);

  if (payload.contactEmail) {
    if (payload.user) {
      try {
        await NotificationServices.createNotification({
          receiver: payload.user,
          title: 'Partner Profile Created',
          message: `A partner profile for "${result.name}" has been created.`,
          refId: result._id,
          path: '/partners',
        });
      } catch (err) {
        logger.error('Error sending partner create notification:', err);
      }
    }

    const targetEmail = payload.contactEmail;
    if (targetEmail) {
      try {
        const emailData = emailTemplate.partnerApplicationUserConfirmation({
          email: targetEmail,
          name: payload.name,
          partnerName: result.name,
        });
        await emailHelper.sendEmail(emailData);
      } catch (err) {
        logger.error('Error sending partner create email:', err);
      }
    }
  }

  return result;
};

const getAllParnterFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const isAdmin = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  );
  const initQuery = isAdmin ? {} : { status: PARTNER_STATUS.APPROVED };

  const queryParams = { ...query };
  if (!queryParams.sort) {
    queryParams.sort = '-featured -createdAt';
  } else if (
    typeof queryParams.sort === 'string' &&
    !queryParams.sort.includes('featured')
  ) {
    queryParams.sort = `-featured ${queryParams.sort}`;
  }

  const qb = new QueryBuilder(
    Partner.find(initQuery).populate('user', 'name email image phone'),
    queryParams,
  )
    .search(partnerSearchableFields)
    .filter()
    .fields()
    .sort()
    .paginate();

  const [result, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { result, pagination };
};

const getSingleParnterFromDB = async (id: string) => {
  const result = await Partner.findById(id).populate(
    'user',
    'name email image phone',
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner not found');
  }
  return result;
};

const updatePartnerFromDB = async (id: string, payload: Partial<IPartner>) => {
  const isExist = await Partner.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner not found');
  }
  if (payload.image && isExist.image !== payload.image) {
    unlinkFile(isExist.image);
  }
  const result = await Partner.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deletePartnerFromDB = async (id: string) => {
  const isExist = await Partner.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner not found');
  }

  if (isExist.image) {
    unlinkFile(isExist.image);
  }
  const result = await Partner.findByIdAndDelete(id);
  return result;
};

const getParnterLogosCarrosel = async () => {
  const result = await Partner.find({
    status: PARTNER_STATUS.APPROVED,
  })
    .sort({ featured: -1 })
    .select('image name');
  return result;
};

const changePartnerStatus = async (
  id: string,
  status: PARTNER_STATUS,
  rejectionReason?: string,
) => {
  const isExist = await Partner.findById(id).populate('user');
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Partner not found');
  }

  const updatePayload: Partial<IPartner> = { status };
  if (rejectionReason !== undefined) {
    updatePayload.rejectionReason = rejectionReason;
  }

  const result = await Partner.findByIdAndUpdate(id, updatePayload, {
    new: true,
  });

  const targetUser = isExist.user as any;
  const targetEmail = targetUser?.email || isExist.contactEmail;
  const targetName = targetUser?.name || isExist.name;

  if (targetUser?._id) {
    try {
      await NotificationServices.createNotification({
        receiver: targetUser._id,
        title: `Partner Application ${status}`,
        message: `Your partner application for "${isExist.name}" status has been updated to ${status}.`,
        refId: isExist._id,
        path: '/partners',
      });
    } catch (err) {
      logger.error('Error sending partner status update notification:', err);
    }
  }

  if (targetEmail) {
    try {
      const emailData = emailTemplate.partnerStatusUpdate({
        email: targetEmail,
        name: targetName,
        partnerName: isExist.name,
        status: status,
        rejectionReason: rejectionReason,
      });
      await emailHelper.sendEmail(emailData);
    } catch (err) {
      logger.error('Error sending partner status update email:', err);
    }
  }

  return result;
};

export const PartnerServices = {
  applyPartnerToDB,
  createPartnerToDB,
  getAllParnterFromDB,
  getSingleParnterFromDB,
  updatePartnerFromDB,
  deletePartnerFromDB,
  getParnterLogosCarrosel,
  changePartnerStatus,
};

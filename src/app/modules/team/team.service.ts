import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ITeam } from './team.interface';
import { Team } from './team.model';
import unlinkFile from '../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

import config from '../../../config';
import { NotificationServices } from '../notification/notification.service';

const applyAsVolunteerToDB = async (
  payload: Omit<ITeam, 'status' | 'category' | 'featured'>,
) => {
  const existingApplication = await Team.findOne({
    email: payload.email,
  });

  if (existingApplication) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'This email already exists as a team member or volunteer.',
    );
  }

  const volunteer = await Team.create({
    ...payload,
    category: 'volunteer',
    status: 'pending',
    featured: false,
  });

  try {
    NotificationServices.sendNotificationToAdmins({
      title: 'New Volunteer Application',
      message: `${payload.name} has applied to be a volunteer.`,
      refId: volunteer._id,
      path: '/team?category=volunteer',
    });

    const emailData = emailTemplate.volunteerApplicationAdminNotification({
      adminEmail: config.support.admin as string,
      adminName: 'Admin',
      applicantName: payload.name,
      applicantEmail: payload.email,
      location: payload.location,
    });
    emailHelper.sendEmail(emailData);
  } catch (err) {
    console.error('Failed to send volunteer notification:', err);
  }

  return volunteer;
};

const createTeamMemberToDB = async (payload: ITeam) => {
  const existingMember = await Team.findOne({
    email: payload.email,
  });

  if (existingMember) {
    if (payload.image) {
      unlinkFile(payload?.image as string);
    }
    throw new ApiError(
      StatusCodes.CONFLICT,
      'A team member with this email already exists.',
    );
  }

  const member = await Team.create(payload);

  try {
    const emailData = emailTemplate.teamMemberCreated({
      email: member.email,
      name: member.name,
      category: member.category,
    });
    emailHelper.sendEmail(emailData);
  } catch (err) {
    console.error('Failed to send team member created email:', err);
  }

  return member;
};

const getAllTeamMembersFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? {}
    : { status: 'active' };

  const qb = new QueryBuilder(Team.find(initQuery), query)
    .search(['name', 'title', 'email', 'category', 'location'])
    .filter()
    .sort()
    .paginate();

  const [teams, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  return { teams, pagination };
};

const getSingleTeamMemberFromDB = async (id: string) => {
  const team = await Team.findById(id).lean();
  if (!team) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team member not found');
  }
  return team;
};

const updateTeamMemberFromDB = async (id: string, payload: Partial<ITeam>) => {
  const existingMember = await Team.findById(id);
  if (!existingMember) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team member not found');
  }
  if (payload.image) {
    unlinkFile(existingMember?.image as string);
  }
  return Team.findByIdAndUpdate(id, payload, { new: true });
};

const updateTeamStatusToDB = async (
  id: string,
  status: 'active' | 'rejected' | 'blocked',
  rejectionReason?: string,
) => {
  const member = await Team.findById(id);

  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team member not found.');
  }

  member.status = status;
  if (status === 'rejected') {
    member.rejectionReason = rejectionReason || '';
  } else {
    member.rejectionReason = '';
  }

  await member.save();

  try {
    const emailData = emailTemplate.teamStatusUpdate({
      email: member.email,
      name: member.name,
      status: member.status,
      rejectionReason: member.rejectionReason,
    });
    emailHelper.sendEmail(emailData);
  } catch (err) {
    console.error('Failed to send team status update email:', err);
  }

  return member;
};

const deleteTeamMemberFromDB = async (id: string) => {
  const existingMember = await Team.findById(id);
  if (!existingMember) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team member not found');
  }
  unlinkFile(existingMember?.image as string);
  return Team.findByIdAndDelete(id);
};

const teamStats = async () => {
  const [totalDirectors, totalMembers, totalVolunteers] = await Promise.all([
    Team.countDocuments({ category: 'director', status: 'active' }),
    Team.countDocuments({ category: 'member', status: 'active' }),
    Team.countDocuments({ category: 'volunteer', status: 'active' }),
  ]);

  const totalVolunteersPending = await Team.countDocuments({
    category: 'volunteer',
    status: 'pending',
  });

  return {
    totalDirectors,
    totalMembers,
    totalVolunteers,
    totalVolunteersPending,
  };
};

export const TeamServices = {
  createTeamMemberToDB,
  getAllTeamMembersFromDB,
  getSingleTeamMemberFromDB,
  updateTeamMemberFromDB,
  deleteTeamMemberFromDB,
  updateTeamStatusToDB,
  applyAsVolunteerToDB,
  teamStats,
};

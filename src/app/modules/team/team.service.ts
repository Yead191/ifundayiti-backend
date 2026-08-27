import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ITeam, TeamModel } from './team.interface';
import { Team } from './team.model';
import unlinkFile from '../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';

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

  return Team.create({
    ...payload,
    category: 'volunteer',
    status: 'pending',
    featured: false,
  });
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

  return Team.create(payload);
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
    .search(['name email category'])
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
) => {
  const member = await Team.findOne({ id });

  if (!member) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Team member not found.');
  }

  member.status = status;

  await member.save();

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

export const TeamServices = {
  createTeamMemberToDB,
  getAllTeamMembersFromDB,
  getSingleTeamMemberFromDB,
  updateTeamMemberFromDB,
  deleteTeamMemberFromDB,
  updateTeamStatusToDB,
  applyAsVolunteerToDB,
};

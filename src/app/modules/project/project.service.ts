import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { IProject } from './project.interface';
import { Project } from './project.model';
import { USER_ROLES } from '../../../enums/user';
import { PROJECT_STATUS } from './project.constants';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';

const createProjectToDB = async (payload: IProject): Promise<IProject> => {
  const result = await Project.create(payload);
  return result;
};
const getAllProjectsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? {}
    : {
        status: PROJECT_STATUS.PUBLISHED,
      };
  const queryBuilder = new QueryBuilder(
    Project.find(initQuery)
      .populate('applicationPeriod', 'title startDate endDate status')
      .select('name description category location image grantAmount'),
    query,
  )
    .search(['name', 'description', 'location', 'category', 'founder'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, pagination] = await Promise.all([
    queryBuilder.modelQuery.lean(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    result,
    pagination,
  };
};

const getSingleProjectFromDB = async (id: string): Promise<IProject> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid project ID');
  }

  const project = await Project.findById(id).populate(
    'applicationPeriod',
    'title startDate endDate status',
  );

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  return project;
};

const updateProjectToDB = async (
  id: string,
  payload: Partial<IProject>,
): Promise<IProject> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid project ID');
  }

  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  return result;
};

const deleteProjectFromDB = async (id: string): Promise<IProject> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid project ID');
  }

  const project = await Project.findById(id);

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  if (project.gallery && project.gallery.length > 0) {
    for (const image of project.gallery) {
      if (image) {
        unlinkFile(image);
      }
    }
  }
  if (project.image) {
    unlinkFile(project.image);
  }

  await Project.findByIdAndDelete(id);

  return project;
};

const updateProjectStatusToDB = async (
  id: string,
  status: PROJECT_STATUS,
): Promise<IProject> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid project ID');
  }

  const project = await Project.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  return project;
};

const toggleProjectFeaturedToDB = async (id: string): Promise<IProject> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid project ID');
  }

  const project = await Project.findById(id);

  if (!project) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  project.featured = !project.featured;

  await project.save();

  return project;
};

export const ProjectServices = {
  createProjectToDB,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectToDB,
  toggleProjectFeaturedToDB,
  updateProjectStatusToDB,
  deleteProjectFromDB,
};

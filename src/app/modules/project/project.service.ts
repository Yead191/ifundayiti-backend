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
      .select('name description category location image grantAmount featured'),
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

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
  }

  // If a new main image is provided, remove the old one
  if (
    payload.image &&
    existingProject.image &&
    payload.image !== existingProject.image
  ) {
    unlinkFile(existingProject.image);
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

const getProjectStatsFromDB = async () => {
  const [stats] = await Project.aggregate([
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        publishedProjects: {
          $sum: {
            $cond: [{ $eq: ['$status', PROJECT_STATUS.PUBLISHED] }, 1, 0],
          },
        },
        draftProjects: {
          $sum: {
            $cond: [{ $eq: ['$status', PROJECT_STATUS.DRAFT] }, 1, 0],
          },
        },
        archivedProjects: {
          $sum: {
            $cond: [{ $eq: ['$status', PROJECT_STATUS.ARCHIVED] }, 1, 0],
          },
        },
        featuredProjects: {
          $sum: {
            $cond: [{ $eq: ['$featured', true] }, 1, 0],
          },
        },
        totalGrantAmount: { $sum: { $ifNull: ['$grantAmount', 0] } },
      },
    },
  ]);

  return {
    totalProjects: stats?.totalProjects || 0,
    publishedProjects: stats?.publishedProjects || 0,
    draftProjects: stats?.draftProjects || 0,
    archivedProjects: stats?.archivedProjects || 0,
    featuredProjects: stats?.featuredProjects || 0,
    totalGrantAmount: stats?.totalGrantAmount || 0,
  };
};

export const ProjectServices = {
  createProjectToDB,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectToDB,
  toggleProjectFeaturedToDB,
  updateProjectStatusToDB,
  deleteProjectFromDB,
  getProjectStatsFromDB,
};

import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IFolder } from './folder.interface';
import { Folder } from './folder.model';
import { folderSearchableFields, FOLDER_STATUS } from './folder.constants';
import { Gallery } from '../gallery/gallery.model';
import unlinkFile from '../../../shared/unlinkFile';
import { USER_ROLES } from '../../../enums/user';

const createFolderToDB = async (payload: IFolder) => {
  try {
    const isExist = await Folder.findOne({
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, 'i') },
    });

    if (isExist) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'A folder with this name already exists.',
      );
    }

    const result = await Folder.create(payload);
    return result;
  } catch (error: any) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to create folder',
    );
  }
};

const getAllFoldersFromDB = async (
  user?: JwtPayload,
  query?: Record<string, unknown>,
) => {
  const isAdmin =
    user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(user?.role);

  const initQuery: Record<string, unknown> = isAdmin
    ? {}
    : { status: FOLDER_STATUS.PUBLISHED };

  const queryParams = { ...query };
  if (!queryParams.sort) {
    queryParams.sort = '-featured -createdAt';
  }

  const folderQuery = new QueryBuilder(Folder.find(initQuery), queryParams)
    .search(folderSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [rawFolders, pagination] = await Promise.all([
    folderQuery.modelQuery.lean(),
    folderQuery.getPaginationInfo(),
  ]);

  const folders = rawFolders as unknown as Array<
    IFolder & { _id: Types.ObjectId }
  >;
  const folderIds = folders.map(f => f._id);
  const galleryCounts = await Gallery.aggregate([
    { $match: { folder: { $in: folderIds } } },
    { $group: { _id: '$folder', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    galleryCounts.map(item => [item._id.toString(), item.count]),
  );

  const result = folders.map(folder => ({
    ...folder,
    galleryCount: countMap.get(folder._id.toString()) || 0,
  }));

  return {
    pagination,
    result,
  };
};

const getSingleFolderFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID.');
  }

  const folder = await Folder.findById(id).lean();

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found.');
  }

  const galleryCount = await Gallery.countDocuments({ folder: id });

  return {
    ...folder,
    galleryCount,
  };
};

const updateFolderToDB = async (id: string, payload: Partial<IFolder>) => {
  if (!Types.ObjectId.isValid(id)) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID.');
  }

  const existingFolder = await Folder.findById(id);
  if (!existingFolder) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found.');
  }

  if (payload.name) {
    const isExist = await Folder.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, 'i') },
    });
    if (isExist) {
      if (payload.image) {
        unlinkFile(payload.image);
      }
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Another folder with this name already exists.',
      );
    }
  }

  // If a new image was uploaded and there is an existing image, unlink the old image
  if (
    payload.image &&
    existingFolder.image &&
    payload.image !== existingFolder.image
  ) {
    unlinkFile(existingFolder.image);
  }

  const updatedFolder = await Folder.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );

  if (!updatedFolder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found.');
  }

  return updatedFolder;
};

const updateFolderStatusToDB = async (
  id: string,
  status: FOLDER_STATUS,
): Promise<IFolder> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID');
  }

  const folder = await Folder.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  return folder;
};

const toggleFolderFeaturedToDB = async (id: string): Promise<IFolder> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID');
  }

  const folder = await Folder.findById(id);

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  folder.featured = !folder.featured;
  await folder.save();

  return folder;
};

const getFolderStatsFromDB = async () => {
  const [stats] = await Folder.aggregate([
    {
      $group: {
        _id: null,
        totalFolders: { $sum: 1 },
        publishedFolders: {
          $sum: {
            $cond: [{ $eq: ['$status', FOLDER_STATUS.PUBLISHED] }, 1, 0],
          },
        },
        draftFolders: {
          $sum: {
            $cond: [{ $eq: ['$status', FOLDER_STATUS.DRAFT] }, 1, 0],
          },
        },
        archivedFolders: {
          $sum: {
            $cond: [{ $eq: ['$status', FOLDER_STATUS.ARCHIVED] }, 1, 0],
          },
        },
        featuredFolders: {
          $sum: {
            $cond: [{ $eq: ['$featured', true] }, 1, 0],
          },
        },
      },
    },
  ]);

  const totalImages = await Gallery.countDocuments();

  return {
    totalFolders: stats?.totalFolders || 0,
    publishedFolders: stats?.publishedFolders || 0,
    draftFolders: stats?.draftFolders || 0,
    archivedFolders: stats?.archivedFolders || 0,
    featuredFolders: stats?.featuredFolders || 0,
    totalImages,
  };
};

const deleteFolderToDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID.');
  }

  const folder = await Folder.findById(id);

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found.');
  }

  // 1. Remove the folder's own cover image if it exists
  if (folder.image) {
    unlinkFile(folder.image);
  }

  // 2. Find all gallery images assigned to this folder
  const associatedGalleries = await Gallery.find({ folder: id });

  // 3. Remove all associated image files from disk using unlinkFile
  for (const gallery of associatedGalleries) {
    if (gallery.image) {
      unlinkFile(gallery.image);
    }
  }

  // 4. Delete all assigned gallery records from DB
  await Gallery.deleteMany({ folder: id });

  // 5. Delete the folder document
  const result = await Folder.findByIdAndDelete(id);
  return result;
};

export const FolderServices = {
  createFolderToDB,
  getAllFoldersFromDB,
  getSingleFolderFromDB,
  updateFolderToDB,
  updateFolderStatusToDB,
  toggleFolderFeaturedToDB,
  getFolderStatsFromDB,
  deleteFolderToDB,
};

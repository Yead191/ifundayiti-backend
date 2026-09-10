import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IFolder } from './folder.interface';
import { Folder } from './folder.model';
import { folderSearchableFields } from './folder.constants';
import { Gallery } from '../gallery/gallery.model';
import unlinkFile from '../../../shared/unlinkFile';

const createFolderToDB = async (payload: IFolder) => {
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
};

const getAllFoldersFromDB = async (query: Record<string, unknown>) => {
  const folderQuery = new QueryBuilder(Folder.find(), query)
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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID.');
  }

  if (payload.name) {
    const isExist = await Folder.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${payload.name.trim()}$`, 'i') },
    });

    if (isExist) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Another folder with this name already exists.',
      );
    }
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

const deleteFolderToDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID.');
  }

  const folder = await Folder.findById(id);

  if (!folder) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found.');
  }

  // Find all gallery images assigned to this folder
  const associatedGalleries = await Gallery.find({ folder: id });

  // Remove all associated image files from disk using unlinkFile
  for (const gallery of associatedGalleries) {
    if (gallery.image) {
      unlinkFile(gallery.image);
    }
  }

  // Delete all assigned gallery records from DB
  await Gallery.deleteMany({ folder: id });

  const result = await Folder.findByIdAndDelete(id);
  return result;
};

export const FolderServices = {
  createFolderToDB,
  getAllFoldersFromDB,
  getSingleFolderFromDB,
  updateFolderToDB,
  deleteFolderToDB,
};

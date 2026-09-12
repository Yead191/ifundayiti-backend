import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IGallery, ICreateGalleryPayload } from './gallery.interface';
import { Gallery } from './gallery.model';
import { gallerySearchableFields } from './gallery.constants';
import { Folder } from '../folder/folder.model';
import unlinkFile from '../../../shared/unlinkFile';

const createGalleryToDB = async (payload: ICreateGalleryPayload) => {
  const cleanupUploadedFiles = () => {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    if (payload.images && Array.isArray(payload.images)) {
      payload.images.forEach(img => unlinkFile(img));
    }
  };

  try {
    if (!payload.folder || !Types.ObjectId.isValid(payload.folder)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID');
    }

    const folderExists = await Folder.findById(payload.folder);
    if (!folderExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
    }

    if (payload.images && payload.images.length > 0) {
      const itemsToCreate = payload.images.map(img => ({
        folder: payload.folder,
        image: img,
        caption: payload.caption || '',
      }));

      const createdItems = await Gallery.insertMany(itemsToCreate);
      return createdItems;
    }

    if (!payload.image) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one image is required');
    }

    const created = await Gallery.create({
      folder: payload.folder,
      image: payload.image,
      caption: payload.caption || '',
    });

    return await Gallery.findById(created._id).populate('folder', 'name');
  } catch (error: any) {
    cleanupUploadedFiles();
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to add image(s) to gallery',
    );
  }
};

const getAllGalleriesFromDB = async (query: Record<string, unknown>) => {
  const queryParams = { ...query };
  if (!queryParams.sort) {
    queryParams.sort = '-createdAt';
  }

  const queryBuilder = new QueryBuilder(
    Gallery.find().populate('folder', 'name image category location date status featured'),
    queryParams,
  )
    .search(gallerySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, pagination] = await Promise.all([
    queryBuilder.modelQuery.lean(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    pagination,
    result,
  };
};

const getSingleGalleryFromDB = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findById(id).populate(
    'folder',
    'name image category location date status featured',
  );

  if (!gallery) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  return gallery;
};

const updateGalleryToDB = async (
  id: string,
  payload: Partial<IGallery>,
): Promise<IGallery> => {
  if (!Types.ObjectId.isValid(id)) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findById(id);
  if (!gallery) {
    if (payload.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  if (payload.folder) {
    if (!Types.ObjectId.isValid(payload.folder as string)) {
      if (payload.image) {
        unlinkFile(payload.image);
      }
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid folder ID');
    }
    const folderExists = await Folder.findById(payload.folder);
    if (!folderExists) {
      if (payload.image) {
        unlinkFile(payload.image);
      }
      throw new ApiError(StatusCodes.NOT_FOUND, 'Target folder not found');
    }
  }

  if (payload.image && payload.image !== gallery.image) {
    unlinkFile(gallery.image);
  }

  const result = await Gallery.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('folder', 'name image category location date status featured');

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Update failed');
  }

  return result;
};

const deleteGalleryFromDB = async (id: string): Promise<IGallery> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findById(id);
  if (!gallery) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  if (gallery.image) {
    unlinkFile(gallery.image);
  }

  const result = await Gallery.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Unable to delete gallery item');
  }

  return result;
};

const deleteMultipleGalleriesFromDB = async (ids: string[]) => {
  const validIds = ids.filter(id => Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid gallery IDs provided');
  }

  const items = await Gallery.find({ _id: { $in: validIds } });
  for (const item of items) {
    if (item.image) {
      unlinkFile(item.image);
    }
  }

  const result = await Gallery.deleteMany({ _id: { $in: validIds } });
  return {
    deletedCount: result.deletedCount,
  };
};

export const GalleryServices = {
  createGalleryToDB,
  getAllGalleriesFromDB,
  getSingleGalleryFromDB,
  updateGalleryToDB,
  deleteGalleryFromDB,
  deleteMultipleGalleriesFromDB,
};

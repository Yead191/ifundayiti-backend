import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { IGallery } from './gallery.interface';
import { Gallery } from './gallery.model';
import { USER_ROLES } from '../../../enums/user';
import { GALLERY_STATUS } from './gallery.constants';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';

const createGalleryToDB = async (payload: IGallery) => {
  return await Gallery.create(payload);
};

const getAllGalleriesFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const initQuery = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(
    user?.role,
  )
    ? {}
    : {
        status: GALLERY_STATUS.PUBLISHED,
      };

  const queryBuilder = new QueryBuilder(Gallery.find(initQuery), query)
    .search(['title', 'description', 'category', 'location'])
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
  const gallery = await Gallery.findById(id);
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
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findById(id);

  if (!gallery) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  if (payload.image && payload.image !== gallery.image) {
    unlinkFile(gallery.image);
  }

  const result = await Gallery.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

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

const updateGalleryStatusToDB = async (
  id: string,
  status: GALLERY_STATUS,
): Promise<IGallery> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!gallery) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  return gallery;
};

const toggleGalleryFeaturedToDB = async (id: string): Promise<IGallery> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid gallery ID');
  }

  const gallery = await Gallery.findById(id);

  if (!gallery) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Gallery item not found');
  }

  gallery.featured = !gallery.featured;

  await gallery.save();

  return gallery;
};

const getGalleryStatsFromDB = async () => {
  const [stats] = await Gallery.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        publishedItems: {
          $sum: {
            $cond: [{ $eq: ['$status', GALLERY_STATUS.PUBLISHED] }, 1, 0],
          },
        },
        draftItems: {
          $sum: {
            $cond: [{ $eq: ['$status', GALLERY_STATUS.DRAFT] }, 1, 0],
          },
        },
        archivedItems: {
          $sum: {
            $cond: [{ $eq: ['$status', GALLERY_STATUS.ARCHIVED] }, 1, 0],
          },
        },
        featuredItems: {
          $sum: {
            $cond: [{ $eq: ['$featured', true] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    totalItems: stats?.totalItems || 0,
    publishedItems: stats?.publishedItems || 0,
    draftItems: stats?.draftItems || 0,
    archivedItems: stats?.archivedItems || 0,
    featuredItems: stats?.featuredItems || 0,
  };
};

export const GalleryServices = {
  createGalleryToDB,
  getAllGalleriesFromDB,
  getSingleGalleryFromDB,
  updateGalleryToDB,
  deleteGalleryFromDB,
  updateGalleryStatusToDB,
  toggleGalleryFeaturedToDB,
  getGalleryStatsFromDB,
};

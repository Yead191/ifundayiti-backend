import { Request, Response } from 'express';
import { GalleryServices } from './gallery.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { StatusCodes } from 'http-status-codes';

const createGallery = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  const multipleImages = getMultipleFilesPath(req.files, 'image');
  const singleImage = getSingleFilePath(req.files, 'image');

  if (multipleImages && multipleImages.length > 1) {
    data.images = multipleImages;
  } else if (singleImage) {
    data.image = singleImage;
  }

  const result = await GalleryServices.createGalleryToDB(data);
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Gallery image(s) added successfully',
    data: result,
  });
});

const getAllGalleries = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryServices.getAllGalleriesFromDB(req.query);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Galleries fetched successfully',
    pagination: result.pagination,
    data: result.result,
  });
});

const getSingleGallery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GalleryServices.getSingleGalleryFromDB(id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery item fetched successfully',
    data: result,
  });
});

const updateGallery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = { ...req.body };
  const image = getSingleFilePath(req.files, 'image');
  if (image) {
    data.image = image;
  }
  const result = await GalleryServices.updateGalleryToDB(id, data);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery item updated successfully',
    data: result,
  });
});

const deleteGallery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await GalleryServices.deleteGalleryFromDB(id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery item deleted successfully',
    data: result,
  });
});

const deleteMultipleGalleries = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const result = await GalleryServices.deleteMultipleGalleriesFromDB(ids);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${result.deletedCount} gallery image(s) deleted successfully`,
      data: result,
    });
  },
);

export const GalleryController = {
  createGallery,
  getAllGalleries,
  getSingleGallery,
  updateGallery,
  deleteGallery,
  deleteMultipleGalleries,
};

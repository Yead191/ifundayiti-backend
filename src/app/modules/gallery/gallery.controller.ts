import { Request, Response } from 'express';
import { GalleryServices } from './gallery.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { StatusCodes } from 'http-status-codes';

const createGallery = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  if (image) {
    data.image = image;
  }
  const result = await GalleryServices.createGalleryToDB(data);
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Gallery item created successfully',
    data: result,
  });
});

const updateGallery = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  let data = req.body;
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

const getAllGalleries = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryServices.getAllGalleriesFromDB(
    req.user,
    req.query,
  );
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

const updateGalleryStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await GalleryServices.updateGalleryStatusToDB(id, status);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery status updated successfully',
    data: result,
  });
});

const toggleGalleryFeatured = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GalleryServices.toggleGalleryFeaturedToDB(id);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Gallery featured status toggled successfully',
      data: result,
    });
  },
);

const getGalleryStats = catchAsync(async (req: Request, res: Response) => {
  const result = await GalleryServices.getGalleryStatsFromDB();
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery stats fetched successfully',
    data: result,
  });
});

export const GalleryController = {
  createGallery,
  getAllGalleries,
  getSingleGallery,
  updateGallery,
  deleteGallery,
  updateGalleryStatus,
  toggleGalleryFeatured,
  getGalleryStats,
};

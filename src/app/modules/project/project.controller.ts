import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import { ProjectServices } from './project.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createProjectToDB = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  const gallery = getMultipleFilesPath(req.files, 'gallery');
  if (image) {
    data.image = image;
  }
  if (gallery && gallery.length > 0) {
    data.gallery = gallery?.map((url: string) => url);
  }
  const result = await ProjectServices.createProjectToDB(data);
  return sendResponse(res, {
    success: true,
    message: 'Project created successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const getAllProjectsFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getAllProjectsFromDB(
    req.user,
    req.query,
  );
  return sendResponse(res, {
    success: true,
    message: 'Projects fetched successfully',
    statusCode: StatusCodes.OK,
    data: result.result,
    pagination: result.pagination,
  });
});

const getSingleProjectFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProjectServices.getSingleProjectFromDB(req.params.id);
    return sendResponse(res, {
      success: true,
      message: 'Project fetched successfully',
      statusCode: StatusCodes.OK,
      data: result,
    });
  },
);

const updateProjectToDB = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  const gallery = getMultipleFilesPath(req.files, 'gallery');
  if (image) {
    data.image = image;
  }
  if (gallery && gallery.length > 0) {
    data.gallery = gallery?.map((url: string) => url);
  }
  const result = await ProjectServices.updateProjectToDB(req.params.id, data);
  return sendResponse(res, {
    success: true,
    message: 'Project updated successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const deleteProjectFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.deleteProjectFromDB(req.params.id);
  return sendResponse(res, {
    success: true,
    message: 'Project deleted successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const updateProjectStatusToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProjectServices.updateProjectStatusToDB(
      req.params.id,
      req.body.status,
    );
    return sendResponse(res, {
      success: true,
      message: 'Project status updated successfully',
      statusCode: StatusCodes.OK,
      data: result,
    });
  },
);

const toggleProjectFeaturedToDB = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProjectServices.toggleProjectFeaturedToDB(
      req.params.id,
    );
    return sendResponse(res, {
      success: true,
      message: 'Project featured updated successfully',
      statusCode: StatusCodes.OK,
      data: result,
    });
  },
);

const getProjectStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getProjectStatsFromDB();
  return sendResponse(res, {
    success: true,
    message: 'Project stats fetched successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

export const ProjectController = {
  createProjectToDB,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectToDB,
  deleteProjectFromDB,
  updateProjectStatusToDB,
  toggleProjectFeaturedToDB,
  getProjectStats,
};

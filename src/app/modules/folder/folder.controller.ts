import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FolderServices } from './folder.service';

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.createFolderToDB(req.body);
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Folder created successfully',
    data: result,
  });
});

const getAllFolders = catchAsync(async (req: Request, res: Response) => {
  const result = await FolderServices.getAllFoldersFromDB(req.query);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folders fetched successfully',
    pagination: result.pagination,
    data: result.result,
  });
});

const getSingleFolder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FolderServices.getSingleFolderFromDB(id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder fetched successfully',
    data: result,
  });
});

const updateFolder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FolderServices.updateFolderToDB(id, req.body);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder updated successfully',
    data: result,
  });
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FolderServices.deleteFolderToDB(id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Folder deleted successfully',
    data: result,
  });
});

export const FolderController = {
  createFolder,
  getAllFolders,
  getSingleFolder,
  updateFolder,
  deleteFolder,
};

import { Request, Response, NextFunction } from 'express';
import { TeamServices } from './team.service';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const applyAsVolunteer = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  if (image) {
    data.image = image;
  }
  const result = await TeamServices.applyAsVolunteerToDB(data);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team member applied successfully',
    data: result,
  });
});

const createTeamMember = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  if (image) {
    data.image = image;
  }
  const result = await TeamServices.createTeamMemberToDB(data);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team member created successfully',
    data: result,
  });
});

const getAllTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const { teams, pagination } = await TeamServices.getAllTeamMembersFromDB(
    req.user,
    req.query,
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team members fetched successfully',
    data: teams,
    pagination: pagination,
  });
});

const getSingleTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.getSingleTeamMemberFromDB(req.params.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team member fetched successfully',
    data: result,
  });
});

const updateTeamMember = catchAsync(async (req: Request, res: Response) => {
  let data = req.body;
  const image = getSingleFilePath(req.files, 'image');
  if (image) {
    data.image = image;
  }
  const result = await TeamServices.updateTeamMemberFromDB(req.params.id, data);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team member updated successfully',
    data: result,
  });
});

const updateTeamStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.updateTeamStatusToDB(
    req.params.id,
    req.body.status,
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team status updated successfully',
    data: result,
  });
});

const deleteTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.deleteTeamMemberFromDB(req.params.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Team member deleted successfully',
    data: result,
  });
});

export const TeamController = {
  applyAsVolunteer,
  createTeamMember,
  getAllTeamMembers,
  getSingleTeamMember,
  updateTeamMember,
  updateTeamStatus,
  deleteTeamMember,
};

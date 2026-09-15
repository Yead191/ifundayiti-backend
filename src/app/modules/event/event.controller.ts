import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { EventService } from './event.service';

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const image = getSingleFilePath(req.files, 'image');

  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  if (image) {
    data.image = image;
  }

  const result = await EventService.createEventToDB(user, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Event created successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await EventService.getAllEventsFromDB(req.query, user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Events retrieved successfully',
    data: result.events,
    pagination: result.pagination,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.getSingleEventFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files, 'image');

  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  if (image) {
    data.image = image;
  }

  const result = await EventService.updateEventInDB(id, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.deleteEventFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

const getEventStats = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventStatsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event statistics retrieved successfully',
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
};

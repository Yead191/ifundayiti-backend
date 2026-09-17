import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

import { EventService } from './event.service';
import { formatEventPayloadWithFiles } from './event.constants';

/**
 * Normalizes event payload and correctly places uploaded files:
 * - `image` -> `data.image` (Event banner)
 * - `avatar` -> `data.speakers[i].avatar` (Inside speakerSchema subdocuments)
 */

const createEvent = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = formatEventPayloadWithFiles(req);

  const result = await EventService.createEventToDB(user, data);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Event created successfully',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await EventService.getAllEventsFromDB(req.query, user);

  return sendResponse(res, {
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

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event retrieved successfully',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = formatEventPayloadWithFiles(req);

  const result = await EventService.updateEventInDB(id, data);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event updated successfully',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EventService.deleteEventFromDB(id);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event deleted successfully',
    data: result,
  });
});

const getEventStats = catchAsync(async (req: Request, res: Response) => {
  const result = await EventService.getEventStatsFromDB(req.query);

  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Event statistics retrieved successfully',
    data: result,
  });
});

const getNearestUpcomingEvent = catchAsync(
  async (req: Request, res: Response) => {
    const result = await EventService.getNearestUpcomingEventFromDB(req.query);

    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result
        ? 'Nearest upcoming event retrieved successfully'
        : 'No upcoming events found',
      data: result,
    });
  },
);

export const EventController = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  getNearestUpcomingEvent,
};


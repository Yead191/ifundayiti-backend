import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { BookingsServices } from './bookings.service';

/**
 * Reserve or purchase an event ticket
 */
const bookEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.bookEventIntoDB(req.user, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.isPaid
      ? 'Payment session created successfully'
      : 'Event ticket reserved successfully',
    data: result,
  });
});

/**
 * Check in an attendee using their ticket code
 */
const checkInTicket = catchAsync(async (req: Request, res: Response) => {
  const ticketCode = req.params.ticketCode || req.body.ticketCode;
  const result = await BookingsServices.checkInTicket(ticketCode);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

/**
 * Render luxury gold & black ticket HTML for viewing / printing / PDF download
 */
const getTicketHtml = catchAsync(async (req: Request, res: Response) => {
  const idOrCode = req.params.idOrCode;
  const html = await BookingsServices.renderTicketHtml(idOrCode);
  res.setHeader('Content-Type', 'text/html');
  res.status(StatusCodes.OK).send(html);
});

/**
 * Get all bookings with filtering & pagination
 */
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.getAllBookings(req.user, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.bookings,
    pagination: result.pagination,
  });
});

/**
 * Get single booking by ID
 */
const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.getBookingById(req.params.id, req.user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking details retrieved successfully',
    data: result,
  });
});

/**
 * Update booking status
 */
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.updateBookingStatus(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

/**
 * Delete a booking
 */
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingsServices.deleteBooking(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking deleted successfully',
    data: result,
  });
});

export const BookingsController = {
  bookEvent,
  checkInTicket,
  getTicketHtml,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};

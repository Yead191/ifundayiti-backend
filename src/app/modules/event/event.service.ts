import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';
import unlinkFile from '../../../shared/unlinkFile';
import { IEvent } from './event.interface';
import { Event } from './event.model';
import { Bookings } from '../bookings/bookings.model';

const createEventToDB = async (
  user: JwtPayload,
  payload: Partial<IEvent>,
): Promise<IEvent> => {
  payload.createdBy = new Types.ObjectId(user.id);

  // If virtual, pricing is strictly free
  if (payload.type === 'virtual') {
    payload.pricingType = 'free';
    payload.price = 0;
  }

  const result = await Event.create(payload);
  return result;
};

const getAllEventsFromDB = async (
  query: Record<string, any>,
  user?: JwtPayload,
) => {
  const initQuery =
    user && [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)
      ? {}
      : {
          status: 'published',
        };

  const eventQuery = new QueryBuilder(
    Event.find(initQuery).populate({
      path: 'createdBy',
      select: 'name email image role',
    }),
    query,
  )
    .search(['title', 'description', 'location', 'venueAddress'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [events, pagination] = await Promise.all([
    eventQuery.modelQuery.lean(),
    eventQuery.getPaginationInfo(),
  ]);

  return { events, pagination };
};

const getSingleEventFromDB = async (id: string): Promise<IEvent> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event ID');
  }

  const event = await Event.findById(id).populate({
    path: 'createdBy',
    select: 'name email image role',
  });

  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  return event;
};

const updateEventInDB = async (
  id: string,
  payload: Partial<IEvent>,
): Promise<IEvent | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event ID');
  }

  const existingEvent = await Event.findById(id);
  if (!existingEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // If virtual, pricing is strictly free
  if (payload.type === 'virtual') {
    payload.pricingType = 'free';
    payload.price = 0;
  }

  // If a new image is provided and is different from existing, unlink old image
  if (
    payload.image &&
    existingEvent.image &&
    existingEvent.image !== payload.image &&
    !existingEvent.image.startsWith('http')
  ) {
    unlinkFile(existingEvent.image);
  }

  const result = await Event.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );

  return result;
};

const deleteEventFromDB = async (id: string): Promise<IEvent | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event ID');
  }

  const existingEvent = await Event.findById(id);
  if (!existingEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  if (existingEvent.image && !existingEvent.image.startsWith('http')) {
    unlinkFile(existingEvent.image);
  }

  const result = await Event.findByIdAndDelete(id);
  return result;
};

const getEventStatsFromDB = async () => {
  const now = new Date();

  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    pastEvents,
    totalBookings,
    revenueStats,
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: 'published' }),
    Event.countDocuments({ status: 'draft' }),
    Event.countDocuments({ startDate: { $gte: now }, status: 'published' }),
    Event.countDocuments({ endDate: { $lt: now } }),
    Bookings.countDocuments({ status: { $in: ['confirmed', 'attended'] } }),
    Bookings.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]),
  ]);

  return {
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    pastEvents,
    totalBookings,
    totalRevenue: revenueStats[0]?.totalRevenue || 0,
  };
};

export const EventService = {
  createEventToDB,
  getAllEventsFromDB,
  getSingleEventFromDB,
  updateEventInDB,
  deleteEventFromDB,
  getEventStatsFromDB,
};

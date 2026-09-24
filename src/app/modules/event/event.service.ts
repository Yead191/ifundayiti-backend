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

  // If speakers are updated, preserve existing avatar if not re-uploaded, and unlink old replaced avatar
  if (
    payload.speakers &&
    Array.isArray(payload.speakers) &&
    existingEvent.speakers
  ) {
    payload.speakers.forEach((sp, idx) => {
      const oldSpeaker = existingEvent.speakers?.[idx];
      if (!sp.avatar && oldSpeaker?.avatar) {
        sp.avatar = oldSpeaker.avatar;
      } else if (
        sp.avatar &&
        oldSpeaker?.avatar &&
        oldSpeaker.avatar !== sp.avatar &&
        !oldSpeaker.avatar.startsWith('http')
      ) {
        unlinkFile(oldSpeaker.avatar);
      }
    });
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

  if (existingEvent.speakers && Array.isArray(existingEvent.speakers)) {
    existingEvent.speakers.forEach(sp => {
      if (sp.avatar && !sp.avatar.startsWith('http')) {
        unlinkFile(sp.avatar);
      }
    });
  }

  const result = await Event.findByIdAndDelete(id);
  return result;
};

const getEventStatsFromDB = async (query: Record<string, any> = {}) => {
  const now = new Date();

  const eventFilter: Record<string, any> = {};
  const bookingFilter: Record<string, any> = {
    status: { $ne: 'cancelled' },
  };

  const targetEventId = query?.event || query?.eventId;
  if (targetEventId && Types.ObjectId.isValid(targetEventId)) {
    eventFilter._id = new Types.ObjectId(targetEventId);
    bookingFilter.event = new Types.ObjectId(targetEventId);
  }

  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    pastEvents,
    bookingAggregates,
    revenueStats,
  ] = await Promise.all([
    Event.countDocuments(eventFilter),
    Event.countDocuments({ ...eventFilter, status: 'published' }),
    Event.countDocuments({ ...eventFilter, status: 'draft' }),
    Event.countDocuments({
      ...eventFilter,
      startDate: { $gte: now },
      status: 'published',
    }),
    Event.countDocuments({ ...eventFilter, endDate: { $lt: now } }),
    // Aggregate booking counts (paid, free, checked-in) across active bookings
    Bookings.aggregate([
      { $match: bookingFilter },
      {
        $group: {
          _id: null,
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
          },
          freeBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'free'] }, 1, 0] },
          },
          paidReservedSeats: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'paid'] },
                { $ifNull: ['$quantity', 1] },
                0,
              ],
            },
          },
          freeReservedSeats: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'free'] },
                { $ifNull: ['$quantity', 1] },
                0,
              ],
            },
          },
          totalCheckedIn: {
            $sum: { $cond: [{ $eq: ['$checkedIn', true] }, 1, 0] },
          },
        },
      },
    ]),
    // Aggregate revenue from paid bookings (support updatedPrice, price, or totalPrice)
    Bookings.aggregate([
      {
        $match: {
          ...bookingFilter,
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $gt: ['$updatedPrice', 0] },
                '$updatedPrice',
                { $ifNull: ['$price', { $ifNull: ['$totalPrice', 0] }] },
              ],
            },
          },
        },
      },
    ]),
  ]);

  const bAgg = bookingAggregates[0] || {};
  const totalRevenue = revenueStats[0]?.totalRevenue || 0;
  const paidBookings = bAgg.paidBookings || 0;
  const freeBookings = bAgg.freeBookings || 0;
  const totalBookings = paidBookings + freeBookings;
  const paidReservedSeats = bAgg.paidReservedSeats || 0;
  const freeReservedSeats = bAgg.freeReservedSeats || 0;
  const totalReservedSeats = paidReservedSeats + freeReservedSeats;
  const totalCheckedIn = bAgg.totalCheckedIn || 0;

  return {
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    pastEvents,
    totalBookings,
    paidBookings,
    freeBookings,
    totalReservedSeats,
    paidReservedSeats,
    freeReservedSeats,
    totalRevenue,
    totalCheckedIn,
  };
};

const getNearestUpcomingEventFromDB = async (
  query?: Record<string, unknown>,
): Promise<IEvent | null> => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const utcStartOfToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const thresholdDate = new Date(
    Math.min(startOfToday.getTime(), utcStartOfToday.getTime()),
  );

  const filter: Record<string, any> = {
    status: 'published',
    $or: [
      { endDate: { $gte: now } },
      { startDate: { $gte: thresholdDate } },
      { endDate: { $gte: thresholdDate } },
    ],
  };

  if (query?.category) {
    filter.category = query.category;
  }
  if (query?.type) {
    filter.type = query.type;
  }
  if (query?.featured !== undefined) {
    filter.featured = query.featured === 'true' || query.featured === true;
  }

  const event = await Event.findOne(filter).sort({ startDate: 1 }).populate({
    path: 'createdBy',
    select: 'name email image role',
  });

  return event;
};

export const EventService = {
  createEventToDB,
  getAllEventsFromDB,
  getSingleEventFromDB,
  updateEventInDB,
  deleteEventFromDB,
  getEventStatsFromDB,
  getNearestUpcomingEventFromDB,
};

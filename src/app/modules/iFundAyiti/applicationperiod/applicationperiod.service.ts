import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { IApplicationperiod } from './applicationperiod.interface';
import { Applicationperiod } from './applicationperiod.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Application } from '../application/application.model';

const determineStatus = (
  startDate: Date,
  endDate: Date,
): 'Upcoming' | 'Open' | 'Review' => {
  const today = new Date();
  if (today < startDate) {
    return 'Upcoming';
  } else if (today >= startDate && today <= endDate) {
    return 'Open';
  } else {
    return 'Review'; // Using 'Review' consistently for ended periods
  }
};

/**
 * Validates that a manually-supplied status is consistent with the given date range.
 * Rules:
 *   Upcoming        → startDate must be in the future
 *   Open            → today must be within [startDate, endDate]
 *   Review / WinnerSelection / Closed → endDate must be in the past
 */
const validateStatusAgainstDates = (
  status: string,
  startDate: Date,
  endDate: Date,
) => {
  const today = new Date();

  if (status === 'Upcoming' && today >= startDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot set status to 'Upcoming' because the start date (${startDate.toDateString()}) has already passed.`,
    );
  }

  if (status === 'Open') {
    if (today < startDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot set status to 'Open' because the period hasn't started yet (starts ${startDate.toDateString()}).`,
      );
    }
    if (today > endDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot set status to 'Open' because the end date (${endDate.toDateString()}) has already passed.`,
      );
    }
  }

  if (
    ['Review', 'WinnerSelection', 'Closed'].includes(status) &&
    today <= endDate
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot set status to '${status}' because the period has not ended yet (ends ${endDate.toDateString()}).`,
    );
  }
};

const createApplicationPeriodToDB = async (payload: IApplicationperiod) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (startDate >= endDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'start date should be before end date',
    );
  }

  // If admin manually supplies a status, validate it against the dates
  if (payload.status) {
    validateStatusAgainstDates(payload.status, startDate, endDate);
  }

  // If admin tries to manually create an 'Open' period, ensure no other is already Open
  if (payload.status === 'Open') {
    const alreadyOpen = await Applicationperiod.findOne({ status: 'Open' });
    if (alreadyOpen) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Another grant cycle "${alreadyOpen.title}" is already Open. Please close it before creating a new open cycle.`,
      );
    }
  }

  const isOverlaping = await Applicationperiod.findOne({
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  if (isOverlaping) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'There is already an application period with this date range',
    );
  }

  const updatedPayload = { ...payload };
  if (!updatedPayload.status) {
    updatedPayload.status = determineStatus(startDate, endDate);
  }

  const result = await Applicationperiod.create(updatedPayload);
  return result;
};

const getAllApplicationPeriodFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Applicationperiod.find(), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [periods, pagination] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);

  const periodIds = periods.map(period => period._id);
  const counts = await Application.aggregate([
    {
      $match: {
        applicationPeriod: { $in: periodIds },
      },
    },
    {
      $group: {
        _id: '$applicationPeriod',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    counts.map(item => [item._id.toString(), item.count]),
  );

  const periodsWithCounts = periods.map(period => ({
    ...period,
    totalApplicationsSubmitted: countMap.get(period._id?.toString()) || 0,
  }));

  return { periods: periodsWithCounts, pagination };
};

const getSingleApplicationPeriodFromDB = async (id: string) => {
  const period = await Applicationperiod.findById(id);
  if (!period) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application period not found');
  }
  return period;
};

//get current application by today time
const getCurrentApplicationPeriodFromDB = async () => {
  const today = new Date();
  return await Applicationperiod.findOne({
    status: 'Open',
  });
};

const updateApplicationPeriodToDB = async (
  id: string,
  payload: Partial<IApplicationperiod>,
) => {
  const period = await Applicationperiod.findById(id);
  if (!period) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application period not found');
  }

  const startDate = new Date(payload.startDate || period.startDate);
  const endDate = new Date(payload.endDate || period.endDate);
  const today = new Date();

  // 1. Basic date sanity check
  if (startDate >= endDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'End date must be after start date.',
    );
  }

  // 2. If admin manually sets a status, validate it is consistent with the dates
  if (payload.status) {
    validateStatusAgainstDates(payload.status, startDate, endDate);
  }

  // 3. Guard: Cannot set status to 'Open' if another period is already Open
  if (payload.status === 'Open') {
    const alreadyOpenPeriod = await Applicationperiod.findOne({
      _id: { $ne: id },
      status: 'Open',
    });
    if (alreadyOpenPeriod) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Another grant cycle "${alreadyOpenPeriod.title}" is already Open. Please close it before opening a new cycle.`,
      );
    }
  }

  // 4. Date overlap check (excluding this period itself)
  const isOverlapping = await Applicationperiod.findOne({
    _id: { $ne: id },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  if (isOverlapping) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Another application period already exists within this date range.',
    );
  }

  const updatedPayload = { ...payload };

  // 5. Auto-determine status from dates only if status is not being manually set
  if ((payload.startDate || payload.endDate) && !payload.status) {
    updatedPayload.status = determineStatus(startDate, endDate);
  }

  const updatedPeriod = await Applicationperiod.findByIdAndUpdate(
    id,
    updatedPayload,
    { new: true },
  );
  return updatedPeriod;
};

const deleteApplicationPeriodFromDB = async (id: string) => {
  const period = await Applicationperiod.findById(id);
  if (!period) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Application period not found');
  }
  const deletePeriod = await Applicationperiod.findByIdAndDelete(id);
  return deletePeriod;
};

export const ApplicationperiodServices = {
  createApplicationPeriodToDB,
  getAllApplicationPeriodFromDB,
  getSingleApplicationPeriodFromDB,
  getCurrentApplicationPeriodFromDB,
  updateApplicationPeriodToDB,
  deleteApplicationPeriodFromDB,
};

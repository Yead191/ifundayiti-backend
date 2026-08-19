import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { IApplicationperiod } from './applicationperiod.interface';
import { Applicationperiod } from './applicationperiod.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Application } from '../application/application.model';

const determineStatus = (startDate: Date, endDate: Date): 'Upcoming' | 'Open' | 'Review' => {
    const today = new Date();
    if (today < startDate) {
        return 'Upcoming';
    } else if (today >= startDate && today <= endDate) {
        return 'Open';
    } else {
        return 'Review'; // Using 'Review' consistently for ended periods
    }
};

const createApplicationPeriodToDB = async (payload: IApplicationperiod) => {
    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);

    if (startDate >= endDate) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'start date should be before end date')
    }
    const isOverlaping = await Applicationperiod.findOne({
        startDate: {
            $lte: endDate
        },
        endDate: {
            $gte: startDate
        }
    })
    if (isOverlaping) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'There is already an application period with this date range')
    }

    const updatedPayload = { ...payload };
    if (!updatedPayload.status) {
        updatedPayload.status = determineStatus(startDate, endDate);
    }

    const result = await Applicationperiod.create(updatedPayload)
    return result
}

const getAllApplicationPeriodFromDB = async (query: Record<string, any>) => {
    const qb = new QueryBuilder(Applicationperiod.find(), query)
        .search(["title"])
        .filter()
        .sort()
        .paginate()
        .fields()

    const [periods, pagination] = await Promise.all([
        qb.modelQuery.lean(),
        qb.getPaginationInfo()
    ])

    const periodIds = periods.map(period => period._id);
    const counts = await Application.aggregate([
        {
            $match: {
                applicationPeriod: { $in: periodIds }
            }
        },
        {
            $group: {
                _id: "$applicationPeriod",
                count: { $sum: 1 }
            }
        }
    ]);

    const countMap = new Map(counts.map(item => [item._id.toString(), item.count]));

    const periodsWithCounts = periods.map(period => ({
        ...period,
        totalApplicationsSubmitted: countMap.get(period._id?.toString()) || 0
    }));

    return { periods: periodsWithCounts, pagination }
}


const getSingleApplicationPeriodFromDB = async (id: string) => {
    const period = await Applicationperiod.findById(id)
    if (!period) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Application period not found")
    }
    return period
}

//get current application by today time
const getCurrentApplicationPeriodFromDB = async () => {
    const today = new Date();
    return await Applicationperiod.findOne({
        status: 'Open',
    });
};


const updateApplicationPeriodToDB = async (id: string, payload: Partial<IApplicationperiod>) => {
    const period = await Applicationperiod.findById(id)
    if (!period) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Application period not found")
    }
    const startDate = new Date(payload.startDate || period.startDate);
    const endDate = new Date(payload.endDate || period.endDate);

    if (startDate >= endDate) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'End date must be after start date.'
        );
    }
    console.log(payload, 'update period')
    const isOverlapping = await Applicationperiod.findOne({
        _id: {
            $ne: id,
        },
        startDate: {
            $lte: endDate,
        },
        endDate: {
            $gte: startDate,
        },
    });

    if (isOverlapping) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Another application period already exists within this date range.'
        );
    }

    const updatedPayload = {
        ...payload,
    };
    if ((payload.startDate || payload.endDate) && !payload.status) {
        updatedPayload.status = determineStatus(startDate, endDate);
    }


    const updatedPeriod = await Applicationperiod.findByIdAndUpdate(id, updatedPayload, { new: true });
    return updatedPeriod
}

const deleteApplicationPeriodFromDB = async (id: string) => {
    const period = await Applicationperiod.findById(id)
    if (!period) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Application period not found")
    }
    const deletePeriod = await Applicationperiod.findByIdAndDelete(id)
    return deletePeriod
}



export const ApplicationperiodServices = { createApplicationPeriodToDB, getAllApplicationPeriodFromDB, getSingleApplicationPeriodFromDB, getCurrentApplicationPeriodFromDB, updateApplicationPeriodToDB, deleteApplicationPeriodFromDB };


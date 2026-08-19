import { Request, Response, NextFunction } from 'express';
import { ApplicationperiodServices } from './applicationperiod.service';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplicationperiodServices.createApplicationPeriodToDB(req.body);

    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period created successfully',
        data: result
    })

})

const getAllApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplicationperiodServices.getAllApplicationPeriodFromDB(req.query);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period fetched successfully',
        data: result.periods,
        pagination: result.pagination
    })

})

const getSingleApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ApplicationperiodServices.getSingleApplicationPeriodFromDB(id);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period fetched successfully',
        data: result
    })

})

const getCurrentApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const result = await ApplicationperiodServices.getCurrentApplicationPeriodFromDB();
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period fetched successfully',
        data: result
    })

})

const updateApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ApplicationperiodServices.updateApplicationPeriodToDB(id, req.body);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period updated successfully',
        data: result
    })
})

const deleteApplicationPeriod = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ApplicationperiodServices.deleteApplicationPeriodFromDB(id);
    return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Application period deleted successfully',
        data: result
    })
})


export const ApplicationperiodController = { createApplicationPeriod, getAllApplicationPeriod, getSingleApplicationPeriod, getCurrentApplicationPeriod, updateApplicationPeriod, deleteApplicationPeriod };

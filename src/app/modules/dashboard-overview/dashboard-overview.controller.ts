import { Request, Response, } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

import { DashboardOverviewServices } from './dashboard-overview.service';
import { StatusCodes } from 'http-status-codes';

const getDashboardOverview = catchAsync(async (req: Request, res: Response,) => {
    const result = await DashboardOverviewServices.getDashboardOverview();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Dashboard overview fetched successfully',
        data: result
    })
})

export const DashboardOverviewController = {
    getDashboardOverview
};

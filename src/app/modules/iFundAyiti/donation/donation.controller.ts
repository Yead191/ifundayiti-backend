import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DonationServices } from './donation.service';

const createDonation = catchAsync(async (req: Request, res: Response) => {
  const hostUrl = `http://10.10.26.173:5003/api/v1`;
  const result = await DonationServices.createDonationToDB(req.body, hostUrl);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Donation checkout session created',
    data: result,
  });
});

const getAllDonations = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationServices.getAllDonationsFromDB(req.query);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Donations fetched successfully',
    data: result.transactions,
    pagination: result.pagination
  });
});

const handleWebhook = async (req: Request, res: Response) => {
  console.log(req.query)
  const status = req.query.status as string;

  try {
    const event = DonationServices.updateStatusToDB(status, res);
    console.log(event);
  } catch (error) {
    console.log(error);
  }
}

const getFundStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationServices.getFundStatsFromDB();
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Fund stats fetched successfully',
    data: result,
  });
});

export const DonationController = {
  createDonation,
  getAllDonations,
  handleWebhook,
  getFundStats

};

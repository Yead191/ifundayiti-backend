import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { DonationServices } from './donation.service';

const createDonation = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationServices.createDonationToDB(req.body);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Donation checkout session created',
    data: result,
  });
});

const getAllDonations = catchAsync(async (req: Request, res: Response) => {
  const result = await DonationServices.getAllDonationsFromDB(
    req.user,
    req.query,
  );
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Donations fetched successfully',
    data: result.transactions,
    pagination: result.pagination,
  });
});

const getSingleDonation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DonationServices.getSingleDonationFromDB(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Donation fetched successfully',
    data: result,
  });
});

const deleteDonation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DonationServices.deleteDonationFromDB(id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Donation record deleted successfully',
    data: result,
  });
});

const deleteMultipleDonations = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.body;
    const result = await DonationServices.deleteMultipleDonationsFromDB(ids);
    return sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `${result.deletedCount} donation record(s) deleted successfully`,
      data: result,
    });
  },
);

const handleWebhook = async (req: Request, res: Response) => {
  const status = req.query.status as string;
  try {
    await DonationServices.updateStatusToDB(status, res);
  } catch (error) {
    console.error('Donation redirect error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process redirect',
    });
  }
};

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
  getSingleDonation,
  deleteDonation,
  deleteMultipleDonations,
  handleWebhook,
  getFundStats,
};

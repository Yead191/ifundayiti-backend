import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { PartnerServices } from './partner.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const applyPartner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    const image = getSingleFilePath(req.files, 'image');
    if (image) {
      data.image = image;
    }

    const userId = req.user.id;
    const result = await PartnerServices.applyPartnerToDB(userId, data);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Partner application submitted successfully',
      data: result,
    });
  },
);

const createPartner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    const image = getSingleFilePath(req.files, 'image');
    if (image) {
      data.image = image;
    }
    const result = await PartnerServices.createPartnerToDB(data);

    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Partner created successfully',
      data: result,
    });
  },
);

const getAllPartner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PartnerServices.getAllParnterFromDB(
      req.user,
      req.query,
    );
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Partner fetched successfully',
      data: result.result,
      pagination: result.pagination,
    });
  },
);

const getSinglePartner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PartnerServices.getSingleParnterFromDB(req.params.id);
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Partner fetched successfully',
      data: result,
    });
  },
);

const updatePartner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    const image = getSingleFilePath(req.files, 'image');
    if (image) {
      data.image = image;
    }

    const result = await PartnerServices.updatePartnerFromDB(
      req.params.id,
      data,
    );
    return sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Partner updated successfully',
      data: result,
    });
  },
);

const deletePartner = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerServices.deletePartnerFromDB(req.params.id);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Partner deleted successfully',
    data: result,
  });
});

const getParnterLogos = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerServices.getParnterLogosCarrosel();
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Partner logos fetched successfully',
    data: result,
  });
});

const changePartnerStatus = catchAsync(async (req: Request, res: Response) => {
  const { id, status, rejectionReason } = req.body;
  const result = await PartnerServices.changePartnerStatus(
    id,
    status,
    rejectionReason,
  );
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Partner status changed successfully',
    data: result,
  });
});

export const PartnerController = {
  applyPartner,
  createPartner,
  getAllPartner,
  getSinglePartner,
  updatePartner,
  deletePartner,
  getParnterLogos,
  changePartnerStatus,
};

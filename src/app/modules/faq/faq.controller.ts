import { Request, Response, NextFunction } from 'express';
import { FaqServices } from './faq.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.createFaq(req.body);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ created successfully',
    data: result,
  });
});

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const { audience } = req.query as { audience: string };
  const result = await FaqServices.getAllFaqs({ audience });
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faqs fetched successfully',
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.deleteFaq(req.params.id);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faq deleted successfully',
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqServices.updateFaq(req.params.id, req.body);
  return sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Faq updated successfully',
    data: result,
  });
});

export const FaqController = { createFaq, getAllFaqs, deleteFaq, updateFaq };

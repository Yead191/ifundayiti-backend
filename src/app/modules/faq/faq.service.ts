import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';

const createFaq = async (payload: IFaq) => {
  const result = await Faq.create(payload);
  return result;
};

const getAllFaqs = async ({ audience }: { audience: string }) => {
  const result = await Faq.find({ audience });
  return result;
};

const deleteFaq = async (id: string) => {
  const result = await Faq.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found');
  }
  return result;
};

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
  const existingFaq = await Faq.findById(id);
  if (!existingFaq) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found');
  }
  const result = await Faq.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

export const FaqServices = { createFaq, getAllFaqs, deleteFaq, updateFaq };

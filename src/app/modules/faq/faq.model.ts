import { Schema, model } from 'mongoose';
import { IFaq, FaqModel } from './faq.interface';
import { USER_ROLES } from '../../../enums/user';

const faqSchema = new Schema<IFaq, FaqModel>({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  audience: {
    type: String,
    enum: [USER_ROLES.USER, USER_ROLES.VENDOR],
    required: true,
  },
});

export const Faq = model<IFaq, FaqModel>('Faq', faqSchema);

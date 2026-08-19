import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IFaq = {
  question: string;
  answer: string;
  audience: USER_ROLES.USER | USER_ROLES.VENDOR;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FaqModel = Model<IFaq>;

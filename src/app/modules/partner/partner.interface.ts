import { Model, Types } from 'mongoose';

export enum PARTNER_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type IPartner = {
  user?: Types.ObjectId;
  name: string;
  image: string;

  description?: string;

  offers: string[];

  website?: string;

  contactEmail?: string;
  contactPhone?: string;

  status: PARTNER_STATUS;
  featured: boolean;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PartnerModel = Model<IPartner>;


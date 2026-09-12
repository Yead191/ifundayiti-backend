import { Model, Types } from 'mongoose';
import { IFolder } from '../folder/folder.interface';

export type IGallery = {
  folder: Types.ObjectId | IFolder | string;
  image: string;
  caption?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ICreateGalleryPayload = {
  folder: string;
  image?: string;
  images?: string[];
  caption?: string;
};

export type GalleryModel = Model<IGallery>;

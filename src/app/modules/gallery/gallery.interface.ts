import { Model, Types } from 'mongoose';
import { GALLERY_STATUS } from './gallery.constants';
import { IFolder } from '../folder/folder.interface';

export type IGallery = {
  title: string;
  description?: string;

  image: string;

  folder?: Types.ObjectId | IFolder | string;

  category?: string;

  location?: string;

  date?: Date;

  status: GALLERY_STATUS;

  featured: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type GalleryModel = Model<IGallery>;


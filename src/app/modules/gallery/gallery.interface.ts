import { Model } from 'mongoose';
import { GALLERY_STATUS } from './gallery.constants';

export type IGallery = {
  title: string;
  description?: string;

  image: string;

  category?: string;

  location?: string;

  date?: Date;

  status: GALLERY_STATUS;

  featured: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type GalleryModel = Model<IGallery>;

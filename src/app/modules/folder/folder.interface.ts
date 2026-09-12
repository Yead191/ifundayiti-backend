import { Model } from 'mongoose';
import { FOLDER_STATUS } from './folder.constants';

export type IFolder = {
  name: string;
  description?: string;
  image?: string;
  category?: string;
  location?: string;
  date?: Date;
  status: FOLDER_STATUS;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FolderModel = Model<IFolder>;

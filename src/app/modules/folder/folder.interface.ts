import { Model } from 'mongoose';

export type IFolder = {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
};

export type FolderModel = Model<IFolder>;

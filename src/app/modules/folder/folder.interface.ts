import { Model } from 'mongoose';

export type IFolder = {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FolderModel = Model<IFolder>;

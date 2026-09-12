import { Schema, model } from 'mongoose';
import { IFolder, FolderModel } from './folder.interface';
import { FOLDER_STATUS } from './folder.constants';

const folderSchema = new Schema<IFolder, FolderModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(FOLDER_STATUS),
      default: FOLDER_STATUS.PUBLISHED,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Folder = model<IFolder, FolderModel>('Folder', folderSchema);

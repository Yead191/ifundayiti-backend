import { Schema, model } from 'mongoose';
import { IFolder, FolderModel } from './folder.interface';

const folderSchema = new Schema<IFolder, FolderModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Folder = model<IFolder, FolderModel>('Folder', folderSchema);

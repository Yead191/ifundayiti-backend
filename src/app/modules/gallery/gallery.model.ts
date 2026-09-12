import { Schema, model } from 'mongoose';
import { IGallery, GalleryModel } from './gallery.interface';

const gallerySchema = new Schema<IGallery, GalleryModel>(
  {
    folder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      required: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

export const Gallery = model<IGallery, GalleryModel>('Gallery', gallerySchema);

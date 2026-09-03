import { Schema, model } from 'mongoose';
import { IGallery, GalleryModel } from './gallery.interface';
import { GALLERY_STATUS } from './gallery.constants';

const gallerySchema = new Schema<IGallery, GalleryModel>({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
    default: '',
  },

  image: {
    type: String,
    required: true,
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
    enum: Object.values(GALLERY_STATUS),
    default: GALLERY_STATUS.DRAFT,
  },

  featured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const Gallery = model<IGallery, GalleryModel>('Gallery', gallerySchema);

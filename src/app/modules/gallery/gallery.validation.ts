import { z } from 'zod';
import { GALLERY_STATUS, GALLERY_CATEGORIES } from './gallery.constants';

const createGalleryZod = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).trim(),
    description: z.string().trim().optional(),
    category: z
      .string({ required_error: 'Category is required' })
      .trim(),
    location: z.string().trim().optional(),
    date: z.string().optional(),
    status: z.nativeEnum(GALLERY_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
  }),
});

const updateGalleryZod = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    location: z.string().trim().optional(),
    image: z.string().optional(),
    date: z.string().optional(),
    status: z.nativeEnum(GALLERY_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
  }),
});

const updateGalleryStatusZod = z.object({
  body: z.object({
    status: z.nativeEnum(GALLERY_STATUS, {
      required_error: 'Status is required',
    }),
  }),
});

const toggleGalleryFeaturedZod = z.object({
  body: z
    .object({
      featured: z.coerce.boolean().optional(),
    })
    .optional(),
});

export const GalleryValidations = {
  createGalleryZod,
  updateGalleryZod,
  updateGalleryStatusZod,
  toggleGalleryFeaturedZod,
};

import { z } from 'zod';

const createGalleryZod = z.object({
  body: z.object({
    folder: z
      .string({ required_error: 'Folder ID is required' })
      .trim()
      .min(1, 'Folder ID cannot be empty'),
    caption: z.string().trim().optional(),
    image: z.string().optional(),
  }),
});

const updateGalleryZod = z.object({
  body: z.object({
    folder: z.string().trim().optional(),
    caption: z.string().trim().optional(),
    image: z.string().optional(),
  }),
});

const deleteMultipleGalleriesZod = z.object({
  body: z.object({
    ids: z
      .array(z.string().min(1, 'ID cannot be empty'), {
        required_error: 'Array of image IDs is required',
      })
      .min(1, 'At least one ID is required'),
  }),
});

export const GalleryValidations = {
  createGalleryZod,
  updateGalleryZod,
  deleteMultipleGalleriesZod,
};

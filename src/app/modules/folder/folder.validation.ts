import { z } from 'zod';
import { FOLDER_STATUS } from './folder.constants';

const createFolderZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Folder name is required' })
      .trim()
      .min(1, 'Folder name cannot be empty'),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    location: z.string().trim().optional(),
    date: z.string().optional(),
    status: z.nativeEnum(FOLDER_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
    image: z.string().optional(),
  }),
});

const updateFolderZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Folder name cannot be empty')
      .optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    location: z.string().trim().optional(),
    date: z.string().optional(),
    status: z.nativeEnum(FOLDER_STATUS).optional(),
    featured: z.coerce.boolean().optional(),
    image: z.string().optional(),
  }),
});

const updateFolderStatusZod = z.object({
  body: z.object({
    status: z.nativeEnum(FOLDER_STATUS, {
      required_error: 'Status is required',
    }),
  }),
});

const toggleFolderFeaturedZod = z.object({
  body: z
    .object({
      featured: z.coerce.boolean().optional(),
    })
    .optional(),
});

export const FolderValidations = {
  createFolderZodSchema,
  updateFolderZodSchema,
  updateFolderStatusZod,
  toggleFolderFeaturedZod,
};

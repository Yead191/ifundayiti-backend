import { z } from 'zod';

const createFolderZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Folder name is required' })
      .trim()
      .min(1, 'Folder name cannot be empty'),
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
    image: z.string().optional(),
  }),
});

export const FolderValidations = {
  createFolderZodSchema,
  updateFolderZodSchema,
};

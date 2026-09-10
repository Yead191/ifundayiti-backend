import { z } from 'zod';

const createFolderZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Folder name is required' })
      .trim()
      .min(1, 'Folder name cannot be empty'),
  }),
});

const updateFolderZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Folder name is required' })
      .trim()
      .min(1, 'Folder name cannot be empty'),
  }),
});

export const FolderValidations = {
  createFolderZodSchema,
  updateFolderZodSchema,
};

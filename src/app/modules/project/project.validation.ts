import { z } from 'zod';
import { PROJECT_CATEGORIES, PROJECT_STATUS } from './project.constants';

const createProjectValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string({ required_error: 'Description is required' }),
    location: z.string({ required_error: 'Location is required' }),
    grantAmount: z.coerce.number().optional(),
    status: z.nativeEnum(PROJECT_STATUS).optional(),
    category: z.enum(PROJECT_CATEGORIES, {
      required_error: 'Category is required',
    }),
    founder: z.string().optional(),
    year: z.coerce.number().optional(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    applicationPeriod: z.string().optional(),
    challenge: z.string().optional(),
    approach: z.string().optional(),
    outcome: z.string().optional(),
    story: z.string().optional(),
    featured: z.coerce.boolean().optional(),
  }),
});

const updateProjectValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    grantAmount: z.coerce.number().optional(),
    status: z.nativeEnum(PROJECT_STATUS).optional(),
    category: z.enum(PROJECT_CATEGORIES).optional(),
    founder: z.string().optional(),
    year: z.coerce.number().optional(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    applicationPeriod: z.string().optional(),
    challenge: z.string().optional(),
    approach: z.string().optional(),
    outcome: z.string().optional(),
    story: z.string().optional(),
    featured: z.coerce.boolean().optional(),
  }),
});

const updateProjectStatusValidation = z.object({
  body: z.object({
    status: z.nativeEnum(PROJECT_STATUS, {
      required_error: 'Status is required',
    }),
  }),
});

export const ProjectValidations = {
  createProjectValidation,
  updateProjectValidation,
  updateProjectStatusValidation,
};

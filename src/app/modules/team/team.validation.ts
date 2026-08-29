import { z } from 'zod';

const createMemberZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    category: z.enum(['director', 'member', 'volunteer'], {
      required_error: 'Category is required',
    }),
    location: z.string({ required_error: 'Location is required' }),
    status: z.enum(['pending', 'active', 'rejected', 'blocked'], {
      required_error: 'Status is required',
    }),
    bio: z.string({ required_error: 'Bio is required' }),
    focusAreas: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    phone: z.string({ required_error: 'Phone is required' }),
  }),
});

const applyVolunteerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    location: z.string({ required_error: 'Location is required' }),
    bio: z.string({ required_error: 'Bio is required' }),
    focusAreas: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }),
});

const updateMemberZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    category: z.enum(['director', 'member', 'volunteer']).optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    phone: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    status: z.enum(['pending', 'active', 'rejected', 'blocked']).optional(),
  }),
});

export const TeamValidations = {
  createMemberZodSchema,
  applyVolunteerZodSchema,
  updateMemberZodSchema,
};

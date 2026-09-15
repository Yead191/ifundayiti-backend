import { z } from 'zod';

const speakerValidationSchema = z.object({
  name: z.string({ required_error: 'Speaker name is required' }),
  role: z.string({ required_error: 'Speaker role is required' }),
  avatar: z.string().optional(),
});

const createEventZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Event title is required' }),
    description: z.string({ required_error: 'Event description is required' }),
    category: z.enum(['fundraiser', 'pitch-night', 'workshop', 'gala'], {
      required_error: 'Category is required',
    }),
    type: z.enum(['physical', 'virtual', 'hybrid'], {
      required_error: 'Event type is required',
    }),
    pricingType: z.enum(['free', 'paid'], {
      required_error: 'Pricing type is required',
    }),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    location: z.string().optional(),
    venueAddress: z.string().optional(),
    virtualLink: z.string().optional(),
    dressCode: z.string().optional(),
    price: z.number().min(0).optional(),
    capacity: z.number().min(0).optional(),
    featured: z.boolean().optional(),
    speakers: z.array(speakerValidationSchema).optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  }),
});

const updateEventZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z
      .enum(['fundraiser', 'pitch-night', 'workshop', 'gala'])
      .optional(),
    type: z.enum(['physical', 'virtual', 'hybrid']).optional(),
    pricingType: z.enum(['free', 'paid']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    location: z.string().optional(),
    venueAddress: z.string().optional(),
    virtualLink: z.string().optional(),
    dressCode: z.string().optional(),
    price: z.number().min(0).optional(),
    capacity: z.number().min(0).optional(),
    featured: z.boolean().optional(),
    speakers: z.array(speakerValidationSchema).optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  }),
});

export const EventValidation = {
  createEventZodSchema,
  updateEventZodSchema,
};

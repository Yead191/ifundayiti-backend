import { z } from 'zod';
import { PARTNER_STATUS } from './partner.interface';

const createPartnerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
    offers: z
      .union([
        z.array(z.string()),
        z.string().transform(val => {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [val];
          } catch {
            return val ? [val] : [];
          }
        }),
      ])
      .optional()
      .default([]),
    website: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
  }),
});

const updatePartnerZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    offers: z
      .union([
        z.array(z.string()),
        z.string().transform(val => {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [val];
          } catch {
            return val ? [val] : [];
          }
        }),
      ])
      .optional(),
    website: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    status: z.nativeEnum(PARTNER_STATUS).optional(),
    featured: z
      .union([
        z.boolean(),
        z.string().transform(v => v === 'true'),
      ])
      .optional(),
    rejectionReason: z.string().optional(),
  }),
});

const changeStatusZodValidation = z.object({
  body: z.object({
    id: z.string({ required_error: 'Id is required' }),
    status: z.nativeEnum(PARTNER_STATUS, {
      required_error: 'Status is required',
    }),
    rejectionReason: z.string().optional(),
  }),
});

export const PartnerValidations = {
  createPartnerZodSchema,
  updatePartnerZodSchema,
  changeStatusZodValidation,
};


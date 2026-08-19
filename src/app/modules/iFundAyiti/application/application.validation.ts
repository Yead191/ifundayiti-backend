import { string, z } from 'zod';
import { APPLICATION_STATUS } from './application.constants';

const personalSchema = z.object({
    name: z
        .string({
            required_error: 'Full name is required',
        })
        .trim()
        .min(2, 'Full name must be at least 2 characters'),

    dob: z.string({
        required_error: 'Date of birth is required',
    }),

    nationality: z
        .string({
            required_error: 'Nationality is required',
        })
        .trim(),

    location: z
        .string({
            required_error: 'Location is required',
        })
        .trim()
        .min(5, 'Location is too short'),
});

const contactSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email address'),

    phone: z
        .string({
            required_error: 'Phone number is required',
        })
        .min(8, 'Invalid phone number'),
});

const identificationSchema = z.object({
    nationalId: z
        .string({
            required_error: 'National ID is required',
        })
        .min(5, 'National ID must be at least 5 characters'),

    passport: z.string().optional(),
});

const grantSchema = z.object({
    projectName: z
        .string({
            required_error: 'Project name is required',
        })
        .trim()
        .min(3, 'Project name must be at least 3 characters'),

    projectDescription: z
        .string({
            required_error: 'Project description is required',
        })
        .min(15, 'Project description must be at least 15 characters'),

    requestedAmount: z.coerce
        .number({
            required_error: 'Requested amount is required',
            invalid_type_error: 'Requested amount must be a number',
        })
        .min(50, 'Requested amount must be at least 50')
        .max(1000, 'Requested amount cannot exceed 1000'),

    fundUsage: z
        .string({
            required_error: 'Fund usage is required',
        })
        .min(15, 'Fund usage must be at least 15 characters'),

    expectedImpact: z
        .string({
            required_error: 'Expected impact is required',
        })
        .min(15, 'Expected impact must be at least 15 characters'),
});

const backgroundSchema = z.object({
    occupation: z
        .string({
            required_error: 'Occupation is required',
        })
        .trim(),

    financialBackground: z
        .string({
            required_error: 'Financial background is required',
        })
        .min(15, 'Financial background must be at least 15 characters'),
});

const createApplicationZodSchema = z.object({
    body: z.object({
        personal: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return personalSchema.parse(parsed)
        }),

        contact: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return contactSchema.parse(parsed)
        }),

        identification: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return identificationSchema.parse(parsed)
        }),

        grant: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return grantSchema.parse(parsed)
        }),

        background: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return backgroundSchema.parse(parsed)
        }),
    }),
});

const updateApplicationZodSchema = z.object({
    body: z.object({
        personal: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return personalSchema.parse(parsed)
        }).optional(),

        contact: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return contactSchema.parse(parsed)
        }).optional(),

        identification: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return identificationSchema.parse(parsed)
        }).optional(),

        grant: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return grantSchema.parse(parsed)
        }).optional(),

        background: z.string().refine((val) => {
            const parsed = JSON.parse(val);
            return backgroundSchema.parse(parsed)
        }).optional(),

        rejectionReason: z.string().trim().optional(),
    }),
});

const trackApplicationZodSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email('Invalid email address'),

        dob: z.string({
            required_error: 'Date of birth is required',
        }),
    }),
});

const updateApplicationStatusSchema = z.object({
    body: z.object({
        status: z.string().trim(),
        rejectionReason: z.string().trim().optional(),
    })
});



export const applicationValidation = {
    createApplicationZodSchema,
    updateApplicationZodSchema,
    trackApplicationZodSchema,
    updateApplicationStatusSchema,
};
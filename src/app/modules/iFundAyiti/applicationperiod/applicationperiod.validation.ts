import { z } from 'zod';

const applicationPeriodStatus = z.enum([
    'Upcoming',
    'Open',
    'Review',
    'WinnerSelection',
    'Closed',
]);

const createApplicationPeriodZodSchema = z.object({
    body: z.object({
        title: z
            .string({
                required_error: 'Application period title is required',
            })
            .trim()
            .min(2, 'Title must be at least 2 characters')
            .max(100, 'Title cannot exceed 100 characters'),

        startDate: z.coerce.date({
            required_error: 'Start date is required',
            invalid_type_error: 'Invalid start date',
        }),

        endDate: z.coerce.date({
            required_error: 'End date is required',
            invalid_type_error: 'Invalid end date',
        }),

        maximumGrantAmount: z.coerce
            .number({
                required_error: 'Maximum grant amount is required',
                invalid_type_error: 'Maximum grant amount must be a number',
            })
            .min(1, 'Maximum grant amount must be greater than 0').max(1000, 'Maximum grant amount must be less than or equal to 1000'),

        status: applicationPeriodStatus.optional(),
    }),
});

const updateApplicationPeriodZodSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(2, 'Title must be at least 2 characters')
            .max(100, 'Title cannot exceed 100 characters')
            .optional(),

        startDate: z.coerce
            .date({
                invalid_type_error: 'Invalid start date',
            })
            .optional(),

        endDate: z.coerce
            .date({
                invalid_type_error: 'Invalid end date',
            })
            .optional(),

        maximumGrantAmount: z.coerce
            .number({
                invalid_type_error: 'Maximum grant amount must be a number',
            })
            .min(1, 'Maximum grant amount must be greater than 0').max(1000, 'Maximum grant amount must be less than or equal to 1000')
            .optional(),

        status: applicationPeriodStatus.optional(),
    }),
});

export const ApplicationPeriodValidation = {
    createApplicationPeriodZodSchema,
    updateApplicationPeriodZodSchema,
};
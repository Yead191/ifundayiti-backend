import { z } from 'zod';

const createEventBookingZod = z.object({
  body: z.object({
    event: z.string({ required_error: 'Event ID is required' }),
    customerPhone: z.string().optional(),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int()
      .min(1, 'Quantity must be at least 1')
      .max(5, 'You can book up to 5 seats for an event')
      .default(1),
    note: z.string().optional(),
  }),
});

const checkInTicketZod = z.object({
  body: z.object({
    ticketCode: z.string({ required_error: 'Ticket code is required' }),
  }),
});

const updateBookingStatusZod = z.object({
  body: z.object({
    status: z.enum(
      ['pending', 'confirmed', 'completed', 'cancelled', 'attended'],
      { required_error: 'Valid status is required' },
    ),
  }),
});

// Generic booking Zod
const createBookingZod = z.object({
  body: z.object({
    event: z.string().optional(),
    service: z.string().optional(),
    note: z.string().optional(),
    phone: z.string().optional(),
    customerPhone: z.string().optional(),
    preferredDate: z.string().optional(),
    preferredTime: z.string().optional(),
    quantity: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int()
      .min(1, 'Quantity must be at least 1')
      .max(5, 'You can book up to 5 seats for an event')
      .optional(),
  }),
});

export const BookingsValidations = {
  createEventBookingZod,
  checkInTicketZod,
  updateBookingStatusZod,
  createBookingZod,
};

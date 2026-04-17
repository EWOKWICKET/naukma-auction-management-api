import { z } from 'zod';

export const createLotSchema = z
  .object({
    itemId: z.string().uuid(),
    startPrice: z.number().positive(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

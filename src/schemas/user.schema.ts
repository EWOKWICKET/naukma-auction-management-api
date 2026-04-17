import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

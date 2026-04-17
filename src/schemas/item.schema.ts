import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
});

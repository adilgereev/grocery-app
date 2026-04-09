import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен').regex(/^[a-z0-9-]+$/, 'Только строчные латинские буквы, цифры и дефис'),
  parent_id: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

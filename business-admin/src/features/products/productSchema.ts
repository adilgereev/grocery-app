import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  unit: z.string().min(1, 'Единица измерения обязательна'),
  stock: z.coerce.number().int().min(0).optional(),
  category_id: z.string().min(1, 'Выберите категорию'),
  is_active: z.boolean().default(true),
  image_url: z.string().nullable().optional(),
  tags: z.string().optional(), // вводятся через запятую, парсим при submit
  calories: z.coerce.number().nullable().optional(),
  proteins: z.coerce.number().nullable().optional(),
  fats: z.coerce.number().nullable().optional(),
  carbohydrates: z.coerce.number().nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

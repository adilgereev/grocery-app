import { z } from 'zod';

/**
 * Схема валидации профиля пользователя
 */
export const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Имя должно быть не короче 2 символов')
    .max(50, 'Имя слишком длинное')
    .trim(),
  last_name: z
    .string()
    .max(50, 'Фамилия слишком длинная')
    .trim()
    .nullable()
    .or(z.literal('')),
});

// Тип данных на основе схемы
export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Схема валидации адреса
 */
export const addressSchema = z.object({
  text: z.string().min(2, 'Минимум 2 символа'),
  house: z.string().min(1, 'Выберите адрес с номером дома'),
  entrance: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  intercom: z.string().optional(),
  comment: z.string().optional(),
  is_private_house: z.boolean(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

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
export const addressSchema = z
  .object({
    text: z.string().min(2, 'Минимум 2 символа').transform((v) => v.trim()),
    house: z.string().min(1, 'Выберите адрес с номером дома'),
    entrance: z
      .string()
      .regex(/^\d{0,2}$/, 'Только цифры')
      .max(2)
      .optional(),
    floor: z
      .string()
      .regex(/^\d{0,3}$/, 'Только цифры')
      .max(3)
      .optional(),
    apartment: z.string().max(10, 'Слишком длинный номер').optional(),
    intercom: z.string().max(20, 'Слишком длинный код').optional(),
    is_private_house: z.boolean(),
    lat: z.number().optional(),
    lon: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const hasLat = data.lat !== undefined;
    const hasLon = data.lon !== undefined;
    if (hasLat !== hasLon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Координаты должны быть полными',
        path: ['lat'],
      });
    }
  });

export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Валидация номера телефона (после нормализации)
 */
export const authPhoneSchema = z
  .string()
  .length(11, 'Введите корректный номер телефона')
  .regex(/^7\d{10}$/, 'Некорректный формат российского номера');

/**
 * Валидация OTP кода
 */
export const otpSchema = z
  .string()
  .length(4, 'Введен неполный код')
  .regex(/^\d{4}$/, 'Код должен содержать только цифры');

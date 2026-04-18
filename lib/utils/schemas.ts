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
});

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

// Опциональное числовое поле КБЖУ — пустая строка разрешена, при заполнении 0–9999
const optionalNutrient = z.string().refine((v) => {
  if (v.trim() === '') return true;
  const n = parseFloat(v.trim());
  return !isNaN(n) && n >= 0 && n <= 9999;
}, 'Введите число от 0 до 9999');

/**
 * Схема валидации формы товара (admin)
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(100, 'Название слишком длинное'),
  description: z.string().max(1000, 'Описание слишком длинное'),
  price: z
    .string()
    .min(1, 'Обязательное поле')
    .refine(
      (v) => !isNaN(parseFloat(v.trim())) && isFinite(parseFloat(v.trim())),
      'Введите корректное число'
    )
    .refine((v) => parseFloat(v.trim()) > 0, 'Цена должна быть > 0'),
  unit: z.string().max(20, 'Слишком длинное'),
  stock: z.string().refine(
    (v) => v.trim() === '' || (Number.isInteger(Number(v.trim())) && Number(v.trim()) >= 0),
    'Целое число ≥ 0'
  ),
  isActive: z.boolean(),
  tags: z.string().max(200, 'Слишком много символов'),
  calories: optionalNutrient,
  proteins: optionalNutrient,
  fats: optionalNutrient,
  carbohydrates: optionalNutrient,
  categoryId: z.string().min(1, 'Выберите категорию'),
});

export type ProductFormData = z.infer<typeof productSchema>;

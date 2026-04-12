import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('Некорректный URL для Supabase'),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Отсутствует Supabase Anon Key'),
  // Можно добавить другие ключи по мере необходимости:
  // EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
});

// Проверяем переменные окружения и экспортируем типизированный результат
const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsedEnv.success) {
  console.error(
    '❌ Ошибка конфигурации среды (Missing Environment Variables):',
    parsedEnv.error.format()
  );
  throw new Error('Ошибки в переменных окружения. Проверьте ваш конфигурационный файл (.env).');
}

export const env = parsedEnv.data;

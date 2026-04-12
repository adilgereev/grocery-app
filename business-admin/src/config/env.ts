import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL должен быть валидным URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Отсутствует VITE_SUPABASE_ANON_KEY'),
});

const parsedEnv = envSchema.safeParse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

if (!parsedEnv.success) {
  console.error(
    '❌ Ошибка конфигурации среды VITE (Missing Environment Variables):',
    parsedEnv.error.format()
  );
  throw new Error('Ошибки в переменных окружения. Проверьте ваш файл .env.');
}

export const env = parsedEnv.data;

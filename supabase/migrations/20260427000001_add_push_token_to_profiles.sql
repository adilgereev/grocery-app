-- Добавить колонку для хранения Expo Push Token пользователя
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token text;

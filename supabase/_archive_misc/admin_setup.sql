-- НАСТРОЙКА АДМИН-ПАНЕЛИ (Фаза 31)

-- 1. Добавляем колонку is_admin в таблицу профилей
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Выдаем права администратора всем текущим зарегистрированным пользователям 
-- (поскольку пока только вы пользуетесь приложением в разработке)
UPDATE public.profiles SET is_admin = true;

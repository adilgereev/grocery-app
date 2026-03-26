-- Миграция: Сделать телефон обязательным полем
-- Для всех пользователей телефон станет обязательным

-- Добавление дефолтного значения для существующих пользователей (если NULL)
UPDATE public.profiles
SET phone = COALESCE(phone, '+7 (000) 000-00-00')
WHERE phone IS NULL OR phone = '';

-- Теперь делаем поле обязательным (NOT NULL)
ALTER TABLE public.profiles
ALTER COLUMN phone SET NOT NULL;

-- Проверка результата
SELECT 'Телефон теперь обязательное поле' as status;

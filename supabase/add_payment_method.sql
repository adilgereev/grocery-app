-- Миграция: Добавление способа оплаты в таблицу orders
-- Для минимальной версии: cash (наличными курьеру), online (онлайн)

-- 1. Создание типа enum для способов оплаты
CREATE TYPE payment_method AS ENUM ('cash', 'online');

-- 2. Добавление поля payment_method в таблицу orders с дефолтным значением 'cash'
ALTER TABLE public.orders
ADD COLUMN payment_method payment_method DEFAULT 'cash' NOT NULL;

-- 3. Обновление существующих заказов (если есть) на 'cash'
UPDATE public.orders
SET payment_method = 'cash'
WHERE payment_method IS NULL;

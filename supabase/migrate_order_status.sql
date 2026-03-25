-- 1. Переименование существующих значений ENUM (Postgres автоматически обновит все старые записи!)
ALTER TYPE order_status RENAME VALUE 'Preparing' TO 'pending';
ALTER TYPE order_status RENAME VALUE 'On the way' TO 'shipped';
ALTER TYPE order_status RENAME VALUE 'Delivered' TO 'delivered';
ALTER TYPE order_status RENAME VALUE 'Cancelled' TO 'cancelled';

-- 2. Добавление недостающего статуса ('processing') для фазы Сборки
ALTER TYPE order_status ADD VALUE 'processing' AFTER 'pending';

-- 3. Обновление значения колонки по умолчанию для новых заказов
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- 4. Включение поддержки Realtime для таблицы orders (WebSockets)
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
  END
  $$;
COMMIT;

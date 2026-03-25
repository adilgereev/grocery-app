-- 1. Удаление старых legacy-статусов из БД
UPDATE public.orders SET status = 'pending' WHERE status::text ILIKE 'Preparing';
UPDATE public.orders SET status = 'shipped' WHERE status::text ILIKE 'On the way';

-- 2. Включение функции Realtime (WebSockets) для изменений в таблице заказов
-- Это позволит клиентам видеть смену статусов без перезагрузки страницы
BEGIN;
  -- Проверяем, добавлена ли таблица, если нет - добавляем
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
  END
  $$;
COMMIT;

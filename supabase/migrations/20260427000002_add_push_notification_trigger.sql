-- Триггер отправки push-уведомлений при смене статуса заказа.
-- Использует pg_net для async HTTP-вызова Edge Function.
--
-- ⚠️ После применения миграции выполнить ONE-TIME команду для сохранения ключа:
--
--   npx supabase db query "INSERT INTO app_config (key, value)
--     VALUES ('service_role_key', '<secret_key>')
--     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;"
--
-- secret_key: npx supabase status → поле "Secret"
-- Для продакшна также добавить 'push_function_url' → URL вашей Edge Function

-- Таблица для хранения app-секретов (не хранить ключи в миграциях/git)
CREATE TABLE IF NOT EXISTS public.app_config (
  key   text PRIMARY KEY,
  value text NOT NULL
);

-- Только SECURITY DEFINER функции имеют доступ — публичного чтения нет
REVOKE ALL ON public.app_config FROM PUBLIC;
GRANT SELECT ON public.app_config TO postgres;

-- Функция-триггер
CREATE OR REPLACE FUNCTION public.send_push_on_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notify_statuses text[] := ARRAY['assembled', 'shipped', 'delivered', 'cancelled'];
  service_key     text;
  function_url    text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT (NEW.status::text = ANY(notify_statuses)) THEN
    RETURN NEW;
  END IF;

  SELECT value INTO service_key  FROM public.app_config WHERE key = 'service_role_key';
  SELECT value INTO function_url FROM public.app_config WHERE key = 'push_function_url';

  function_url := coalesce(
    function_url,
    'http://supabase_edge_runtime:9002/send-push-notification'
  );

  IF service_key IS NOT NULL AND service_key <> '' THEN
    PERFORM net.http_post(
      url     := function_url,
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'type',       'UPDATE',
        'table',      'orders',
        'record',     row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS send_push_notification_trigger ON public.orders;
CREATE TRIGGER send_push_notification_trigger
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_on_order_status_change();

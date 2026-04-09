-- Выдаём права ролям PostgREST на таблицу stories (аналогично остальным таблицам)
GRANT ALL ON stories TO anon, authenticated, service_role;

-- Перезагружаем кеш схемы PostgREST
NOTIFY pgrst, 'reload schema';

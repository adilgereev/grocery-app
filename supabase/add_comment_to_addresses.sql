-- SQL-скрипт для добавления колонки комментария для курьера
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS comment text;

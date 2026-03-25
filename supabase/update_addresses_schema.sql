-- SQL-скрипт для добавления координат в таблицу адресов
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS lat double precision,
ADD COLUMN IF NOT EXISTS lon double precision;

-- Также добавим расширенные поля, если они были пропущены в базовом скрипте, но используются в приложении
ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS house text,
ADD COLUMN IF NOT EXISTS entrance text,
ADD COLUMN IF NOT EXISTS floor text,
ADD COLUMN IF NOT EXISTS intercom text,
ADD COLUMN IF NOT EXISTS apartment text;

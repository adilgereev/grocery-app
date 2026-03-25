-- SQL-скрипт (миграция) для расширения таблицы адресов V2

alter table public.addresses
add column house text,
add column entrance text,
add column floor text,
add column intercom text,
add column apartment text;

-- Обновление комментария таблицы для ясности
comment on table public.addresses is 'Таблица для мульти-форматных адресов (V2)';

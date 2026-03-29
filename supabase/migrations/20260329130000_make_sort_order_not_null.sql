-- Делаем колонку обязательной, чтобы в типах не было | null
ALTER TABLE public.categories ALTER COLUMN sort_order SET NOT NULL;

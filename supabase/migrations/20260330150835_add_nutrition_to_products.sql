-- Добавление полей пищевой ценности в таблицу продуктов
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS calories NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS proteins NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fats NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbohydrates NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.products.calories IS 'Энергетическая ценность (ккал)';
COMMENT ON COLUMN public.products.proteins IS 'Белки (г)';
COMMENT ON COLUMN public.products.fats IS 'Жиры (г)';
COMMENT ON COLUMN public.products.carbohydrates IS 'Углеводы (г)';

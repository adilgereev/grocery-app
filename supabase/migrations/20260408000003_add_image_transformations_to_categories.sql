-- Колонка image_transformations не была применена на remote (миграция 20260402 была
-- помечена как applied без выполнения). Добавляем с IF NOT EXISTS для идемпотентности.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_transformations text;

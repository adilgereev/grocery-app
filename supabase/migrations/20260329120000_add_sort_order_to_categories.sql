-- 1. Добавляем колонку в основную таблицу
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Инициализируем значения (алфавитный порядок по умолчанию для существующих данных)
DO $$
DECLARE
    root_record RECORD;
    child_record RECORD;
    counter INTEGER;
BEGIN
    -- Сначала для корневых категорий
    counter := 1;
    FOR root_record IN (SELECT id FROM public.categories WHERE parent_id IS NULL ORDER BY name ASC) LOOP
        UPDATE public.categories SET sort_order = counter WHERE id = root_record.id;
        counter := counter + 1;
    END LOOP;

    -- Теперь для каждой группы дочерних категорий
    FOR root_record IN (SELECT id FROM public.categories WHERE parent_id IS NULL) LOOP
        counter := 1;
        FOR child_record IN (SELECT id FROM public.categories WHERE parent_id = root_record.id ORDER BY name ASC) LOOP
            UPDATE public.categories SET sort_order = counter WHERE id = child_record.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- 3. Обновляем View (добавляем sort_order и сохраняем структуру)
DROP VIEW IF EXISTS public.categories_with_hierarchy;
CREATE VIEW public.categories_with_hierarchy AS
SELECT 
  c.id, 
  c.name, 
  c.slug, 
  c.image_url, 
  c.parent_id, 
  c.created_at, 
  c.sort_order,
  p.name as parent_name, 
  p.slug as parent_slug, 
  p.image_url as parent_image_url,
  (c.parent_id IS NULL) as is_root,
  (SELECT count(*) FROM public.categories WHERE parent_id = c.id) as subcategory_count
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id;

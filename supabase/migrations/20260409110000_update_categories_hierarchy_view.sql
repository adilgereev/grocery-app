-- Обновляем view categories_with_hierarchy: добавляем is_active в SELECT
-- DROP + CREATE вместо CREATE OR REPLACE — нельзя менять порядок колонок через OR REPLACE
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
  c.is_active,
  p.name as parent_name,
  p.slug as parent_slug,
  p.image_url as parent_image_url,
  (c.parent_id IS NULL) as is_root,
  (SELECT count(*) FROM public.categories WHERE parent_id = c.id) as subcategory_count
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id;

-- Создание view для удобной работы с иерархией категорий
-- Представление содержит расширенную информацию о категориях с родительскими данными

CREATE OR REPLACE VIEW public.categories_with_hierarchy AS
SELECT
  c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  p.image_url as parent_image_url,
  CASE
    WHEN c.parent_id IS NULL THEN true
    ELSE false
  END as is_root,
  -- Количество подкатегорий для каждой категории
  (SELECT COUNT(*) FROM public.categories WHERE parent_id = c.id) as subcategory_count
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id;

-- Предоставляем доступ к представлению для всех пользователей
GRANT SELECT ON public.categories_with_hierarchy TO authenticated;
GRANT SELECT ON public.categories_with_hierarchy TO anon;

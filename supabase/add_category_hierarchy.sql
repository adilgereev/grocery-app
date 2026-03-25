-- Миграция для добавления иерархии категорий
-- Добавляет поле parent_id для связи подкатегорий с родительскими категориями

-- Добавляем поле parent_id в таблицу categories
ALTER TABLE public.categories
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Создаем индекс для быстрого поиска дочерних категорий по parent_id
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Создаем частичный индекс для быстрого поиска корневых категорий
-- (категории без родителя)
CREATE INDEX idx_categories_root ON public.categories(parent_id)
WHERE parent_id IS NULL;

-- Добавляем уникальное ограничение на комбинацию parent_id + slug
-- У одной родительской категории не могут быть две подкатегории с одинаковым slug
CREATE UNIQUE INDEX idx_categories_parent_slug ON public.categories(parent_id, slug)
WHERE parent_id IS NOT NULL;

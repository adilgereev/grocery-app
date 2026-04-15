-- Удаляем дублирующуюся политику SELECT для таблицы categories.
-- Оставляем "Allow select for all", удаляем идентичную "Categories are viewable by everyone."
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;

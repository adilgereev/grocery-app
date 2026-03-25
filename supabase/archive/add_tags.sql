-- СКРИПТ ДОБАВЛЕНИЯ ТЕГОВ (Фаза 29)
-- 1. Добавляем колонку tags
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Наполняем товары тегами
-- Овощи и Фрукты
UPDATE public.products SET tags = ARRAY['Фрукты', 'Сладкое'] WHERE name ILIKE '%Яблок%' OR name ILIKE '%Банан%';
UPDATE public.products SET tags = ARRAY['Фрукты', 'Для салата'] WHERE name ILIKE '%Авокадо%';
UPDATE public.products SET tags = ARRAY['Ягоды', 'Сладкое'] WHERE name ILIKE '%Голубика%';
UPDATE public.products SET tags = ARRAY['Овощи', 'Для салата'] WHERE name ILIKE '%Помидор%';

-- Молочка
UPDATE public.products SET tags = ARRAY['Молоко', 'Напитки'] WHERE name ILIKE '%Молоко%';
UPDATE public.products SET tags = ARRAY['Сыр', 'На завтрак'] WHERE name ILIKE '%Сыр%';
UPDATE public.products SET tags = ARRAY['Творог', 'На завтрак', 'Спорт'] WHERE name ILIKE '%Творог%';
UPDATE public.products SET tags = ARRAY['Яйца', 'На завтрак'] WHERE name ILIKE '%Яйц%';

-- Мясо и Рыба
UPDATE public.products SET tags = ARRAY['Мясо', 'Стейки', 'На гриль'] WHERE name ILIKE '%Стейк%' OR name ILIKE '%Рибай%';
UPDATE public.products SET tags = ARRAY['Рыба', 'Морепродукты', 'Охлажденное'] WHERE name ILIKE '%Лосось%';

-- Бакалея
UPDATE public.products SET tags = ARRAY['Кофе', 'Напитки', 'На завтрак'] WHERE name ILIKE '%Кофе%';
UPDATE public.products SET tags = ARRAY['Крупы', 'Гарнир'] WHERE name ILIKE '%Рис%';
UPDATE public.products SET tags = ARRAY['Макароны', 'Гарнир'] WHERE name ILIKE '%Макарон%';

-- Заморозка
UPDATE public.products SET tags = ARRAY['Готовая еда', 'На компанию'] WHERE name ILIKE '%Пицца%';
UPDATE public.products SET tags = ARRAY['Полуфабрикаты', 'Сытно'] WHERE name ILIKE '%Пельмен%';

-- Сладости
UPDATE public.products SET tags = ARRAY['Шоколад', 'К чаю', 'Сладкое'] WHERE name ILIKE '%Шоколад%';

-- Напитки
UPDATE public.products SET tags = ARRAY['Вода', 'Без сахара'] WHERE name ILIKE '%Вода%';
UPDATE public.products SET tags = ARRAY['Сок', 'Сладкое'] WHERE name ILIKE '%Сок%';

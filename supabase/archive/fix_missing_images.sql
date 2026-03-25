-- ФИНАЛЬНЫЙ ТАРГЕТИРОВАННЫЙ СКРИПТ ДЛЯ КАРТИНОК
-- Этот скрипт использует частичное совпадение (ILIKE), чтобы точно найти товары, даже если в имени есть лишние пробелы или символы.

-- 1. Категория "Мясо и птица"
UPDATE public.categories 
SET image_url = 'https://images.unsplash.com/photo-1607623198457-7aad0d6a8348?q=80&w=800&auto=format&fit=crop' 
WHERE slug = 'meat' OR name ILIKE '%Мясо%';

-- 2. Групповое обновление продуктов (используем ILIKE для надежности)
-- Рис Басмати
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1586201327102-335ad9685edb?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Рис%Басмати%';

-- Молоко (все виды)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1563636619-e910ef2a855b?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Молоко%';

-- Творог
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1485921000281-659518c44237?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Творог%';

-- Яйца (и С0, и C0 - латиница/кириллица)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1587486918502-d24b6e48a5b8?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Яйц%';

-- Питьевая вода
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Вода%';

-- Бананы
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1481349579423-ba96c36e4b3a?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Банан%';

-- Помидоры Черри
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?q=80&w=800&auto=format&fit=crop' 
WHERE name ILIKE '%Помидор%Черри%';

-- 3. Дополнительная проверка: если что-то осталось пустым (на всякий случай)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url = '' OR image_url LIKE '#%';

UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url LIKE '#%';

-- УЛЬТРА-НАДЕЖНЫЙ СКРИПТ ОБНОВЛЕНИЯ (V3)
-- Использует широкие маски поиска и оптимизированные для мобилок размеры фото (w=400)

-- 1. КАТЕГОРИИ (Обновляем всё, что связано с мясом)
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Мясо%' OR slug = 'meat';

-- 2. ПРОДУКТЫ (Точечно по списку пользователя)

-- Рис Басмати
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1586201327102-335ad9685edb?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Рис%' AND name ILIKE '%Басмати%';

-- Молоко (все варианты: 3.2%, 2.5% и просто Молоко)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1563636619-e910ef2a855b?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Молоко%';

-- Творог
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1485921000281-659518c44237?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Творог%';

-- Яйца (Охватываем и С0 русскую, и C0 английскую)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1587486918502-d24b6e48a5b8?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Яйц%';

-- Питьевая вода
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Вода%';

-- Бананы
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1481349579423-ba96c36e4b3a?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Банан%';

-- Помидоры Черри
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Помидор%';

-- Бакалея (Кофе, Макароны и т.д. для полноты)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80' 
WHERE name ILIKE '%Кофе%';

-- 3. ПОСЛЕДНЯЯ ПРОВЕРКА
-- Если в image_url все еще HEX-код (MVP-заглушка), заменяем на универсальное фото корзины
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' 
WHERE image_url LIKE '#%';

UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=400&q=80' 
WHERE image_url LIKE '#%';

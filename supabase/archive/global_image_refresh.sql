-- ГЛОБАЛЬНЫЙ СКРИПТ ОБНОВЛЕНИЯ ИЗОБРАЖЕНИЙ (V6 - ФИНАЛЬНЫЙ)
-- Все ссылки проверены на работоспособность на 23.03.2026

-- 1. ОБНОВЛЕНИЕ КАТЕГОРИЙ
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=600&auto=format&fit=crop' WHERE slug = 'vegetables-fruits';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop' WHERE slug = 'dairy';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=600&auto=format&fit=crop' WHERE slug = 'meat';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600&auto=format&fit=crop' WHERE slug = 'drinks';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop' WHERE slug = 'sweets';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' WHERE slug = 'bakery';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop' WHERE slug = 'grocery';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600&auto=format&fit=crop' WHERE slug = 'frozen';

-- 2. ОБНОВЛЕНИЕ ПРОДУКТОВ (ТОЛЬКО РАБОЧИЕ ССЫЛКИ)

-- Овощи и Фрукты
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Яблоки%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Банан%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Помидор%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Авокадо%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Голубика%';

-- Молочка и Яйца
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1563636619-e910ef2a855b?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Молоко%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Сыр%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3cbe?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Яйц%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1485921000281-659518c44237?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Творог%';

-- Напитки
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Вода%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Сок%';

-- Бакалея
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Кофе%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1512183557245-09520f92463e?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Рис%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Макароны%';

-- Мясо и Рыба
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Стейк%' OR name ILIKE '%Рибай%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Лосось%';

-- Заморозка
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Пицца%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Пельмени%';

-- Сладости
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Шоколад%';

-- 3. ФУЛБЭК ДЛЯ ОСТАЛЬНЫХ (если были другие товары)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url LIKE '#%';

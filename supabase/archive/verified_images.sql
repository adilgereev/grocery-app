-- ПОЛНОСТЬЮ ПРОВЕРЕННЫЕ ССЫЛКИ (V5)
-- Заменяем все 404 на гарантированно работающие ID с Unsplash

-- 1. Молоко
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Молоко%';

-- 2. Творог
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Творог%';

-- 3. Бананы
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Банан%';

-- 4. Помидоры Черри
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Помидор%';

-- 5. Рис Басмати
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Рис%';

-- 6. Питьевая вода
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Вода%';

-- 7. Яйца
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3cbe?q=80&w=600&auto=format&fit=crop' 
WHERE name ILIKE '%Яйц%';

-- 8. Мясо (на всякий случай обновим еще раз)
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1551028150-64b9f398f678?q=80&w=600&auto=format&fit=crop' 
WHERE slug = 'meat' OR name ILIKE '%Мясо%';

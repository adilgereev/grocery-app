-- ХИРУРГИЧЕСКИЙ СКРИПТ ПО ID (V4)
-- Если поиск по именам не сработал, бьем точно в цель по UUID из вашей базы.

-- 1. Молоко 3.2%
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop' 
WHERE id = 'a9263dfb-b0c8-44b7-9a36-f9d5315941c5';

-- 2. Творог 9%
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1485921000281-659518c44237?q=80&w=400&auto=format&fit=crop' 
WHERE id = 'a0a0ae32-a4d3-41fc-8778-f0d6a325bceb';

-- 3. Бананы
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1481349579423-ba96c36e4b3a?q=80&w=400&auto=format&fit=crop' 
WHERE id = '0771dc4b-3346-42aa-aeb8-3c7e0d4ebaa4';

-- 4. Помидоры Черри
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?q=80&w=400&auto=format&fit=crop' 
WHERE id = '6644f504-c076-43ab-9b76-8bf61574a30e';

-- 5. Рис Басмати
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1512183557245-09520f92463e?q=80&w=400&auto=format&fit=crop' 
WHERE id = '1ed99767-7e36-4851-802c-e82872f49d66';

-- 6. Питьевая вода
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=400&auto=format&fit=crop' 
WHERE id = 'e9875f97-3b45-4c54-8e71-a8ba1b99e2a9';

-- 7. Яйца С0
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1587486918502-d24b6e48a5b8?q=80&w=400&auto=format&fit=crop' 
WHERE id = 'b4c97f96-c231-4aad-b2ab-a2c5267b1fb5';

-- 8. И на всякий случай — массово по всем товарам, где все еще пусто или HEX
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url LIKE '#%' OR image_url = '';

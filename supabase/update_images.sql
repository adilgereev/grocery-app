-- Обновление изображений категорий (добавление качественных фуд-фото с Unsplash вместо серых/цветных квадратов)
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop' WHERE slug = 'vegetables-fruits';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop' WHERE slug = 'dairy';
-- Фото для категории "Мясо и птица" (заменил на более надежную)
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=600&auto=format&fit=crop' WHERE slug = 'meat';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600&auto=format&fit=crop' WHERE slug = 'drinks';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop' WHERE slug = 'sweets';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' WHERE slug = 'bakery';

-- 1. Обновляем картинки категорий (заменяем HEX-цвета на сочные фото)
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=600&auto=format&fit=crop' WHERE slug = 'vegetables-fruits';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop' WHERE slug = 'dairy';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1607623198457-7aad0d6a8348?q=80&w=600&auto=format&fit=crop' WHERE slug = 'meat';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop' WHERE slug = 'drinks';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?q=80&w=600&auto=format&fit=crop' WHERE slug = 'sweets';
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' WHERE slug = 'bakery';

-- 2. Создаем новые категории, если их еще нет
INSERT INTO public.categories (name, slug, image_url) VALUES 
('Бакалея', 'grocery', 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'),
('Заморозка', 'frozen', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=600&auto=format&fit=crop')
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- 3. Массовое обновление существующих продуктов по именам (на случай, если скрипты выше не сработали)
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%яблоки%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1481349579423-ba96c36e4b3a?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%банан%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1546473427-e1ad068731b7?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%помидор%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1563636619-e910ef2a855b?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%молоко%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%сыр%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%сок%';
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop' WHERE LOWER(name) LIKE '%вода%';

-- 4. Наполняем новыми товарами
DO $$
DECLARE
  v_fruits_id UUID; v_dairy_id UUID; v_meat_id UUID; v_grocery_id UUID; v_frozen_id UUID; v_sweets_id UUID;
BEGIN
  SELECT id INTO v_fruits_id FROM public.categories WHERE slug = 'vegetables-fruits';
  SELECT id INTO v_dairy_id FROM public.categories WHERE slug = 'dairy';
  SELECT id INTO v_meat_id FROM public.categories WHERE slug = 'meat';
  SELECT id INTO v_grocery_id FROM public.categories WHERE slug = 'grocery';
  SELECT id INTO v_frozen_id FROM public.categories WHERE slug = 'frozen';
  SELECT id INTO v_sweets_id FROM public.categories WHERE slug = 'sweets';

  -- Добавляем только если таких имен еще нет
  IF v_fruits_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_fruits_id, 'Авокадо Хаас', 'Спелое подовое авокадо, идеально для тостов', 199.00, '1 шт', 40, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Авокадо Хаас');
    
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_fruits_id, 'Голубика', 'Крупная сладкая ягода из Перу', 249.00, '125 г', 30, 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Голубика');
  END IF;

  IF v_meat_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_meat_id, 'Стейк Рибай', 'Мраморная говядина Prime, зерновой откорм', 890.00, '300 г', 15, 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Стейк Рибай');
    
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_meat_id, 'Филе лосося', 'Охлажденное филе на коже, богато Омега-3', 750.00, '250 г', 12, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Филе лосося');
  END IF;

  IF v_dairy_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_dairy_id, 'Яйца С0', 'Крупные отборные яйца от деревенских кур', 145.00, '10 шт', 100, 'https://images.unsplash.com/photo-1587486918502-d24b6e48a5b8?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Яйца С0');
  END IF;

  IF v_grocery_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_grocery_id, 'Кофе в зернах', '100% Арабика, средняя обжарка', 550.00, '250 г', 45, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Кофе в зернах');
  END IF;

  IF v_frozen_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock, image_url)
    SELECT v_frozen_id, 'Пицца Пепперони', 'С хрустящим бортиком, готова за 10 минут', 450.00, '400 г', 20, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop'
    WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Пицца Пепперони');
  END IF;
END $$;

-- 5. ФИНАЛЬНЫЙ ШТРИХ: Заполняем ВСЕ ПУСТЫЕ картинки (и HEX-заглушки) дефолтными красивыми фото
-- Для категорий
UPDATE public.categories SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url LIKE '#%';

-- Для продуктов
UPDATE public.products SET image_url = 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=600&auto=format&fit=crop' 
WHERE image_url IS NULL OR image_url = '';

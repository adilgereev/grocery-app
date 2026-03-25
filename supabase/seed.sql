-- Заполнение базы данных тестовыми категориями
-- Используем поле image_url в качестве HEX-кода цвета для заглушки дизайна (MVP)
INSERT INTO public.categories (name, slug, image_url) VALUES 
('Овощи и фрукты', 'vegetables-fruits', '#A7F3D0'),   -- Зеленоватый
('Молоко и сыр', 'dairy', '#FDE68A'),             -- Желтоватый
('Мясо и птица', 'meat', '#FECACA'),              -- Красноватый
('Напитки', 'drinks', '#BFDBFE'),                 -- Голубой
('Сладости', 'sweets', '#FBCFE8'),                -- Розовый
('Хлеб и выпечка', 'bakery', '#FED7AA')           -- Оранжевый
ON CONFLICT (slug) DO NOTHING;

-- Заполнение базы данных тестовыми товарами для этих категорий
DO $$
DECLARE
  v_fruits_id UUID;
  v_dairy_id UUID;
  v_drinks_id UUID;
BEGIN
  -- Получаем ID категорий
  SELECT id INTO v_fruits_id FROM public.categories WHERE slug = 'vegetables-fruits';
  SELECT id INTO v_dairy_id FROM public.categories WHERE slug = 'dairy';
  SELECT id INTO v_drinks_id FROM public.categories WHERE slug = 'drinks';

  IF v_fruits_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock) VALUES
    (v_fruits_id, 'Яблоки Гала', 'Свежие хрустящие яблоки, отлично для перекуса', 120.00, '1 кг', 50),
    (v_fruits_id, 'Бананы', 'Сладкие бананы из Эквадора', 140.00, '1 кг', 100),
    (v_fruits_id, 'Помидоры Черри', 'Сладкие помидоры на веточке для салата', 250.00, '250 г', 20);
  END IF;

  IF v_dairy_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock) VALUES
    (v_dairy_id, 'Молоко 3.2%', 'Натуральное фермерское молоко', 85.00, '1 л', 20),
    (v_dairy_id, 'Сыр Чеддер', 'Полутвердый выдержанный сыр', 450.00, '200 г', 15);
  END IF;

  IF v_drinks_id IS NOT NULL THEN
    INSERT INTO public.products (category_id, name, description, price, unit, stock) VALUES
    (v_drinks_id, 'Апельсиновый сок', '100% натуральный сок без сахара', 180.00, '1 л', 30),
    (v_drinks_id, 'Питьевая вода', 'Негазированная минеральная', 40.00, '1.5 л', 200);
  END IF;
END $$;

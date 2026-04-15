-- Seed данные для иерархических категорий
-- Создает 4 родительские категории с по 4 подкатегории в каждой

-- Получаем ID вставленных категорий для создания подкатегорий
DO $$
DECLARE
  molochka_id UUID;
  ovoshi_id UUID;
  myaso_id UUID;
  bakaleya_id UUID;
BEGIN
  -- Создаем или получаем родительские категории
  INSERT INTO public.categories (name, slug, image_url, parent_id) VALUES
  ('Молочные продукты', 'molochka', '#8B5CF6', NULL),
  ('Овощи и фрукты', 'ovoshi-frukty', '#10B981', NULL),
  ('Мясо и птица', 'myaso-ptitsa', '#F59E0B', NULL),
  ('Бакалея', 'bakaleya', '#EF4444', NULL)
  ON CONFLICT (slug) DO NOTHING;

  -- Получаем ID родительских категорий
  SELECT id INTO molochka_id FROM public.categories WHERE slug = 'molochka' LIMIT 1;
  SELECT id INTO ovoshi_id FROM public.categories WHERE slug = 'ovoshi-frukty' LIMIT 1;
  SELECT id INTO myaso_id FROM public.categories WHERE slug = 'myaso-ptitsa' LIMIT 1;
  SELECT id INTO bakaleya_id FROM public.categories WHERE slug = 'bakaleya' LIMIT 1;

  -- Подкатегории для молочных продуктов
  INSERT INTO public.categories (name, slug, image_url, parent_id) VALUES
  ('Молоко, масло и яйца', 'moloko-maylo-yaytsa', '#A78BFA', molochka_id),
  ('Сыры', 'siry', '#C4B5FD', molochka_id),
  ('Кефир, сметана, творог', 'kefir-smetana-tvorog', '#DDD6FE', molochka_id),
  ('Йогурты и десерты', 'yogurty-desserty', '#EDE9FE', molochka_id),
  ('Молочное для детей', 'molochnoe-dlya-detey', '#F5D0FE', molochka_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Подкатегории для овощей и фруктов
  INSERT INTO public.categories (name, slug, image_url, parent_id) VALUES
  ('Овощи', 'ovoshi', '#34D399', ovoshi_id),
  ('Фрукты', 'frukty', '#6EE7B7', ovoshi_id),
  ('Ягоды', 'yagody', '#A7F3D0', ovoshi_id),
  ('Зелень', 'zelen', '#D1FAE5', ovoshi_id),
  ('Овощные смеси', 'ovoshchnye-smesi', '#ECFDF5', ovoshi_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Подкатегории для мяса и птицы
  INSERT INTO public.categories (name, slug, image_url, parent_id) VALUES
  ('Из пекарен', 'iz-pekarne', '#FBBF24', myaso_id),
  ('Валежка', 'valezhka', '#FCD34D', myaso_id),
  ('Хлебцы', 'hlebtsy', '#FDE68A', myaso_id),
  ('Хлеб', 'hleb', '#FEF3C7', myaso_id),
  ('Колбасы и деликатесы', 'kolbasy-delikatesy', '#FFF7ED', myaso_id)
  ON CONFLICT (slug) DO NOTHING;

  -- Подкатегории для бакалеи
  INSERT INTO public.categories (name, slug, image_url, parent_id) VALUES
  ('Крупы', 'kripy', '#F87171', bakaleya_id),
  ('Макароны', 'makarony', '#FCA5A5', bakaleya_id),
  ('Консервы', 'konservy', '#FECACA', bakaleya_id),
  ('Сладости', 'sladosti', '#FEE2E2', bakaleya_id),
  ('Чай, кофе', 'chay-kofe', '#FEE2E2', bakaleya_id)
  ON CONFLICT (slug) DO NOTHING;
END $$;

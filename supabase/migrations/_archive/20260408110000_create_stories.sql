-- Таблица для динамических сторис (акции и новинки)
CREATE TABLE stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(100) NOT NULL,
  subtitle varchar(200),
  image_url text NOT NULL,
  type text NOT NULL DEFAULT 'promo'
    CHECK (type IN ('promo', 'new_product')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Все пользователи (включая анонимных) видят активные сторис
CREATE POLICY "stories_select_active" ON stories
  FOR SELECT USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Только администраторы могут создавать/изменять/удалять сторис
CREATE POLICY "stories_admin_all" ON stories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Начальные данные (акции и новинки)
INSERT INTO stories (title, subtitle, image_url, type, sort_order) VALUES
  ('Свежие овощи', 'Скидка -20% на всё', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800', 'promo', 1),
  ('Новинки выпечки', 'Каждый день свежее', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800', 'new_product', 2),
  ('Бесплатная доставка', 'При заказе от 700₽', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800', 'promo', 3),
  ('Молочная ферма', 'Фермерские продукты', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800', 'new_product', 4);

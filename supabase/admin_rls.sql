-- Включение полных прав для администраторов в таблице orders
-- (Без этого изменения Админ видел только свои заказы, а при попытке обновить чужие — база молча отказывала)

-- 1. Удаляем старые админские политики (на всякий случай, чтобы не было дублей)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;


-- 2. Политика на ЧТЕНИЕ всех заказов для админов
CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 3. Политика на ИЗМЕНЕНИЕ любых заказов для админов
CREATE POLICY "Admins can update all orders" 
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 4. Политики для администрирования товаров (Добавление/Редактирование/Удаление)
CREATE POLICY "Admins can insert products" 
ON public.products FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update products" 
ON public.products FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete products" 
ON public.products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

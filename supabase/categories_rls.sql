-- Разрешение администраторам управлять категориями
-- (Для тех, кто видит ошибку: "new row violates row-level security policy for table categories")

-- 1. Удаляем старые политики, если они есть
DROP POLICY IF EXISTS "Allow select for all" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- 2. Разрешаем ВСЕМ видеть категории (иначе они пропадут с главной)
CREATE POLICY "Allow select for all" 
ON public.categories FOR SELECT 
USING (true);

-- 3. Разрешаем только АДМИНАМ добавлять новые категории
CREATE POLICY "Admins can insert categories" 
ON public.categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 4. Разрешаем только АДМИНАМ редактировать категории
CREATE POLICY "Admins can update categories" 
ON public.categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 5. Разрешаем только АДМИНАМ удалять категории
CREATE POLICY "Admins can delete categories" 
ON public.categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- 1. Создание бакета для хранения изображений
-- (Обычно это делается через интерфейс Supabase, но можно и через SQL)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. Разрешаем ПУБЛИЧНОЕ чтение всех файлов (чтобы картинки отображались в приложении)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- 3. Разрешаем только АДМИНАМ загружать новые файлы
-- (проверка через таблицу public.profiles, как мы делали для категорий)
drop policy if exists "Admins can upload images" on storage.objects;
create policy "Admins can upload images"
on storage.objects for insert
with check (
  bucket_id = 'images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
);

-- 4. Разрешаем только АДМИНАМ удалять файлы
drop policy if exists "Admins can delete images" on storage.objects;
create policy "Admins can delete images"
on storage.objects for delete
using (
  bucket_id = 'images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
);

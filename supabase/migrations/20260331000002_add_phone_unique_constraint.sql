-- Добавление уникальности телефона и обновление триггера создания профиля

-- Частичный уникальный индекс: реальные телефоны уникальны, пустые строки разрешены
CREATE UNIQUE INDEX profiles_phone_unique_idx ON public.profiles (phone)
  WHERE phone != '';

COMMENT ON INDEX public.profiles_phone_unique_idx IS 'Гарантирует уникальность телефона. Пустые строки исключены.';

-- Обновляем триггер: обработка unique_violation при создании профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;

EXCEPTION
  WHEN unique_violation THEN
    -- Телефон уже зарегистрирован — безопасный fallback, создаём с пустым телефоном
    RAISE WARNING 'Телефон уже зарегистрирован при создании профиля для пользователя %', new.id;
    INSERT INTO public.profiles (id, first_name, last_name, avatar_url, phone)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'avatar_url',
      ''
    );
    RETURN new;
END;
$$;

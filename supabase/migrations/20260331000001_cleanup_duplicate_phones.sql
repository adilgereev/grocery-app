-- Очистка дубликатов профилей по номеру телефона
-- Перед добавлением UNIQUE-ограничения нужно удалить дубликаты

DO $$
DECLARE
  dup_phone text;
  canonical_id uuid;
  dup_id uuid;
  dup_record record;
BEGIN
  -- Проходим по всем телефонам, у которых больше одного профиля
  FOR dup_phone IN
    SELECT phone
    FROM public.profiles
    WHERE phone != ''
    GROUP BY phone
    HAVING count(*) > 1
  LOOP
    RAISE NOTICE 'Обработка дубля телефона: %', dup_phone;

    -- Выбираем канонический профиль:
    -- 1. Приоритет is_admin = true
    -- 2. Затем самый старый с заполненными данными
    SELECT id INTO canonical_id
    FROM public.profiles
    WHERE phone = dup_phone
    ORDER BY
      is_admin DESC NULLS LAST,
      (first_name IS NOT NULL AND first_name != '') DESC,
      (last_name IS NOT NULL AND last_name != '') DESC,
      created_at ASC
    LIMIT 1;

    IF canonical_id IS NULL THEN
      RAISE NOTICE 'Не удалось выбрать канонический профиль для %', dup_phone;
      CONTINUE;
    END IF;

    RAISE NOTICE 'Канонический профиль для %: %', dup_phone, canonical_id;

    -- Переносим зависимости с дубликатов на канонический профиль
    FOR dup_id IN
      SELECT id FROM public.profiles
      WHERE phone = dup_phone AND id != canonical_id
    LOOP
      -- Перенос заказов
      UPDATE public.orders SET user_id = canonical_id WHERE user_id = dup_id;

      -- Перенос избранного (игнорируем конфликты уникальности user_id+product_id)
      INSERT INTO public.favorites (user_id, product_id, created_at)
      SELECT canonical_id, product_id, created_at
      FROM public.favorites
      WHERE user_id = dup_id
      ON CONFLICT (user_id, product_id) DO NOTHING;

      -- Удаляем избранное дубликата
      DELETE FROM public.favorites WHERE user_id = dup_id;

      -- Перенос адресов (addresses.user_id -> auth.users, без CASCADE)
      UPDATE public.addresses SET user_id = canonical_id WHERE user_id = dup_id;

      RAISE NOTICE 'Зависимости перенесены с % на %', dup_id, canonical_id;
    END LOOP;

    -- Удаляем auth.users для дубликатов (CASCADE удалит профили)
    DELETE FROM auth.users
    WHERE id IN (
      SELECT id FROM public.profiles
      WHERE phone = dup_phone AND id != canonical_id
    );

    RAISE NOTICE 'Дубликаты для % удалены', dup_phone;
  END LOOP;
END;
$$;

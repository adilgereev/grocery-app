-- ============================================================
-- ЕДИНАЯ МИГРАЦИЯ: Полная схема БД Grocery App
-- Актуальное состояние всех миграций на 01.04.2026
-- Выполнить в SQL Editor Supabase Dashboard одним запросом
-- После этого выполнить seed.sql
-- ============================================================

-- 1. ТИПЫ (ENUM)
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE public.payment_method AS ENUM (
  'cash',
  'online'
);

-- 2. ТАБЛИЦА ПРОФИЛЕЙ
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text NULL,
  last_name text NULL,
  avatar_url text NULL,
  phone text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_admin boolean NULL DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 3. ТАБЛИЦА КАТЕГОРИЙ (включает sort_order)
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  image_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  parent_id uuid NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_slug_key UNIQUE (slug),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_root ON public.categories USING btree (parent_id) WHERE (parent_id IS NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_parent_slug ON public.categories USING btree (parent_id, slug) WHERE (parent_id IS NOT NULL);

-- 4. ТАБЛИЦА ПРОДУКТОВ (включает КБЖУ)
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NULL,
  name text NOT NULL,
  description text NULL,
  price numeric(10, 2) NOT NULL,
  unit text NOT NULL,
  image_url text NULL,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  tags text[] NULL DEFAULT '{}'::text[],
  calories numeric DEFAULT 0,
  proteins numeric DEFAULT 0,
  fats numeric DEFAULT 0,
  carbohydrates numeric DEFAULT 0,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

COMMENT ON COLUMN public.products.calories IS 'Энергетическая ценность (ккал)';
COMMENT ON COLUMN public.products.proteins IS 'Белки (г)';
COMMENT ON COLUMN public.products.fats IS 'Жиры (г)';
COMMENT ON COLUMN public.products.carbohydrates IS 'Углеводы (г)';

-- 5. ТАБЛИЦА OTP-КОДОВ
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '00:05:00'::interval),
  used boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT otp_codes_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes USING btree (phone, used, expires_at);

-- 6. ТАБЛИЦА ЗАКАЗОВ
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending'::order_status,
  total_amount numeric(10, 2) NOT NULL,
  delivery_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  payment_method public.payment_method NOT NULL DEFAULT 'cash'::payment_method,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 7. ТАБЛИЦА ЭЛЕМЕНТОВ ЗАКАЗА
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  price_at_time numeric(10, 2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
  CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);

-- 8. ТАБЛИЦА ИЗБРАННОГО
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_product_id_key UNIQUE (user_id, product_id),
  CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 9. ТАБЛИЦА АДРЕСОВ
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL,
  is_selected boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  house text NULL,
  entrance text NULL,
  floor text NULL,
  intercom text NULL,
  apartment text NULL,
  lat double precision NULL,
  lon double precision NULL,
  comment text NULL,
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
);

-- 10. ПРЕДСТАВЛЕНИЕ (VIEW) ДЛЯ ИЕРАРХИИ КАТЕГОРИЙ (финальная версия с sort_order)
CREATE OR REPLACE VIEW public.categories_with_hierarchy AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.image_url,
  c.parent_id,
  c.created_at,
  c.sort_order,
  p.name AS parent_name,
  p.slug AS parent_slug,
  p.image_url AS parent_image_url,
  (c.parent_id IS NULL) AS is_root,
  (SELECT count(*) FROM public.categories WHERE parent_id = c.id) AS subcategory_count
FROM public.categories c
LEFT JOIN public.categories p ON c.parent_id = p.id;

-- 11. ВКЛЮЧЕНИЕ RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 12. ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT TO public WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));

-- Products
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO public WITH CHECK ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT TO public USING (true);

-- Categories
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO public WITH CHECK ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Allow select for all" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT TO public USING (true);

-- Orders
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO public USING ((EXISTS (SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));
CREATE POLICY "Users can insert their own orders." ON public.orders FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT TO public USING ((auth.uid() = user_id));

-- Order Items
CREATE POLICY "Users can insert their own order items." ON public.order_items FOR INSERT TO public WITH CHECK ((EXISTS (SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));
CREATE POLICY "Users can view their own order items." ON public.order_items FOR SELECT TO public USING ((EXISTS (SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));

-- Favorites
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE TO public USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT TO public USING ((auth.uid() = user_id));

-- Addresses
CREATE POLICY "Users can modify their own addresses" ON public.addresses FOR ALL TO public USING ((auth.uid() = user_id));

-- OTP Codes
CREATE POLICY "Anyone can insert OTP" ON public.otp_codes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read OTP" ON public.otp_codes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update OTP" ON public.otp_codes FOR UPDATE TO public USING (true);

-- 13. ФУНКЦИИ

-- Автоматическое включение RLS для новых таблиц
CREATE OR REPLACE FUNCTION public.rls_auto_enable() RETURNS event_trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
    END IF;
  END LOOP;
END;
$$;

-- Обработка регистрации нового пользователя (финальная версия с unique_violation)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- 14. ТРИГГЕРЫ

-- Триггер на создание нового пользователя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Событийный триггер для авто-включения RLS
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end EXECUTE FUNCTION rls_auto_enable();

-- 15. УНИКАЛЬНЫЙ ИНДЕКС ТЕЛЕФОНА

-- Частичный уникальный индекс: реальные телефоны уникальны, пустые строки разрешены
CREATE UNIQUE INDEX profiles_phone_unique_idx ON public.profiles (phone)
  WHERE phone != '';

COMMENT ON INDEX public.profiles_phone_unique_idx IS 'Гарантирует уникальность телефона. Пустые строки исключены.';

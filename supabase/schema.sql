-- ЧИСТАЯ СХЕМА БАЗЫ ДАННЫХ (Экспорт из консоли Supabase)
-- Проект: Grocery App
-- Состояние на: 27.03.2026

-- 0. ТИПЫ (ENUM)
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

-- 1. ТАБЛИЦА ПРОФИЛЕЙ
create table public.profiles (
  id uuid not null,
  first_name text null,
  last_name text null,
  avatar_url text null,
  phone text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  is_admin boolean null default false,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- 2. ТАБЛИЦА КАТЕГОРИЙ
create table public.categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  image_url text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  parent_id uuid null,
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug),
  constraint categories_parent_id_fkey foreign KEY (parent_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_categories_parent_id on public.categories using btree (parent_id) TABLESPACE pg_default;

create index IF not exists idx_categories_root on public.categories using btree (parent_id) TABLESPACE pg_default
where
  (parent_id is null);

create unique INDEX IF not exists idx_categories_parent_slug on public.categories using btree (parent_id, slug) TABLESPACE pg_default
where
  (parent_id is not null);

-- 3. ТАБЛИЦА ПРОДУКТОВ
create table public.products (
  id uuid not null default gen_random_uuid (),
  category_id uuid null,
  name text not null,
  description text null,
  price numeric(10, 2) not null,
  unit text not null,
  image_url text null,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  tags text[] null default '{}'::text[],
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id) on delete set null
) TABLESPACE pg_default;

-- 4. ТАБЛИЦА OTP-КОДОВ
create table public.otp_codes (
  id uuid not null default gen_random_uuid (),
  phone text not null,
  code text not null,
  expires_at timestamp with time zone not null default (now() + '00:05:00'::interval),
  used boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint otp_codes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_otp_phone on public.otp_codes using btree (phone, used, expires_at) TABLESPACE pg_default;

-- 5. ТАБЛИЦА ЗАКАЗОВ
create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  status public.order_status not null default 'pending'::order_status,
  total_amount numeric(10, 2) not null,
  delivery_address text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  payment_method public.payment_method not null default 'cash'::payment_method,
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

-- 6. ТАБЛИЦА ЭЛЕМЕНТОВ ЗАКАЗА
create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  price_at_time numeric(10, 2) not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete RESTRICT,
  constraint order_items_quantity_check check ((quantity > 0))
) TABLESPACE pg_default;

-- 7. ТАБЛИЦА ИЗБРАННОГО
create table public.favorites (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint favorites_pkey primary key (id),
  constraint favorites_user_id_product_id_key unique (user_id, product_id),
  constraint favorites_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint favorites_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

-- 8. ТАБЛИЦА АДРЕСОВ
create table public.addresses (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  text text not null,
  is_selected boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  house text null,
  entrance text null,
  floor text null,
  intercom text null,
  apartment text null,
  lat double precision null,
  lon double precision null,
  comment text null,
  constraint addresses_pkey primary key (id),
  constraint addresses_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

-- 9. ПРЕДСТАВЛЕНИЕ (VIEW) ДЛЯ ИЕРАРХИИ КАТЕГОРИЙ
CREATE OR REPLACE VIEW public.categories_with_hierarchy AS
 SELECT c.id,
    c.name,
    c.slug,
    c.image_url,
    c.created_at,
    c.parent_id,
    p.name AS parent_name,
    p.slug AS parent_slug,
    p.image_url AS parent_image_url,
        CASE
            WHEN (c.parent_id IS NULL) THEN true
            ELSE false
        END AS is_root,
    ( SELECT count(*) AS count
           FROM categories
          WHERE (categories.parent_id = c.id)) AS subcategory_count
   FROM (categories c
     LEFT JOIN categories p ON ((c.parent_id = p.id)));

-- 10. ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT TO public USING (true) ;
CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT TO public WITH CHECK ((auth.uid() = id)) ;
CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE TO public USING ((auth.uid() = id)) ;

-- Products
CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Products are viewable by everyone." ON "public"."products" FOR SELECT TO public USING (true) ;

-- Categories
CREATE POLICY "Admins can delete categories" ON "public"."categories" FOR DELETE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Admins can insert categories" ON "public"."categories" FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Admins can update categories" ON "public"."categories" FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Allow select for all" ON "public"."categories" FOR SELECT TO public USING (true) ;
CREATE POLICY "Categories are viewable by everyone." ON "public"."categories" FOR SELECT TO public USING (true) ;

-- Orders
CREATE POLICY "Admins can update all orders" ON "public"."orders" FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) ;
CREATE POLICY "Users can insert their own orders." ON "public"."orders" FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)) ;
CREATE POLICY "Users can view their own orders." ON "public"."orders" FOR SELECT TO public USING ((auth.uid() = user_id)) ;

-- Order Items
CREATE POLICY "Users can insert their own order items." ON "public"."order_items" FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))) ;
CREATE POLICY "Users can view their own order items." ON "public"."order_items" FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM orders WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid()))))) ;

-- Favorites
CREATE POLICY "Users can delete their own favorites" ON "public"."favorites" FOR DELETE TO public USING ((auth.uid() = user_id)) ;
CREATE POLICY "Users can insert their own favorites" ON "public"."favorites" FOR INSERT TO public WITH CHECK ((auth.uid() = user_id)) ;
CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT TO public USING ((auth.uid() = user_id)) ;

-- Addresses
CREATE POLICY "Users can modify their own addresses" ON "public"."addresses" FOR ALL TO public USING ((auth.uid() = user_id)) ;

-- OTP Codes
CREATE POLICY "Anyone can insert OTP" ON "public"."otp_codes" FOR INSERT TO public WITH CHECK (true) ;
CREATE POLICY "Anyone can read OTP" ON "public"."otp_codes" FOR SELECT TO public USING (true) ;
CREATE POLICY "Anyone can update OTP" ON "public"."otp_codes" FOR UPDATE TO public USING (true) ;

-- 11. ФУНКЦИИ (FUNCTIONS)

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

-- Обработка регистрации нового пользователя (создание профиля)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ 
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
 $$;

-- 12. ТРИГГЕРЫ (TRIGGERS)

-- Триггер на создание нового пользователя (вызывает handle_new_user)
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- 13. СОБЫТИЙНЫЕ ТРИГГЕРЫ (EVENT TRIGGERS)
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end EXECUTE FUNCTION rls_auto_enable();

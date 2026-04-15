-- ============================================================
-- BASELINE: Полная схема БД Grocery App
-- Актуальное состояние на 15.04.2026
-- Источник: supabase db dump --linked --schema public
-- ============================================================

CREATE SCHEMA IF NOT EXISTS "public";

COMMENT ON SCHEMA "public" IS 'standard public schema';


-- ТИПЫ (ENUM)

CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);

CREATE TYPE "public"."payment_method" AS ENUM (
    'cash',
    'online'
);


-- ФУНКЦИИ

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

CREATE OR REPLACE FUNCTION "public"."select_delivery_address"("p_user_id" "uuid", "p_address_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- 1. Снимаем выбор со всех адресов пользователя
  UPDATE addresses
  SET is_selected = false
  WHERE user_id = p_user_id AND is_selected = true;

  -- 2. Выбираем нужный
  UPDATE addresses
  SET is_selected = true
  WHERE id = p_address_id AND user_id = p_user_id;
END;
$$;


-- ТАБЛИЦЫ

CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "text" "text" NOT NULL,
    "is_selected" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "house" "text",
    "entrance" "text",
    "floor" "text",
    "intercom" "text",
    "apartment" "text",
    "lat" double precision,
    "lon" double precision
);

CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "parent_id" "uuid",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "image_transformations" "text",
    "is_active" boolean DEFAULT true NOT NULL
);

COMMENT ON COLUMN "public"."categories"."is_active" IS 'Видимость категории для покупателей. false — категория скрыта.';

CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "price_at_time" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "delivery_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "payment_method" "public"."payment_method" DEFAULT 'cash'::"public"."payment_method" NOT NULL,
    "comment" "text"
);

CREATE TABLE IF NOT EXISTS "public"."otp_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phone" "text" NOT NULL,
    "code" "text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:05:00'::interval) NOT NULL,
    "used" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "unit" "text" NOT NULL,
    "image_url" "text",
    "stock" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "calories" numeric DEFAULT 0,
    "proteins" numeric DEFAULT 0,
    "fats" numeric DEFAULT 0,
    "carbohydrates" numeric DEFAULT 0
);

COMMENT ON COLUMN "public"."products"."calories" IS 'Энергетическая ценность (ккал)';
COMMENT ON COLUMN "public"."products"."proteins" IS 'Белки (г)';
COMMENT ON COLUMN "public"."products"."fats" IS 'Жиры (г)';
COMMENT ON COLUMN "public"."products"."carbohydrates" IS 'Углеводы (г)';

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "phone" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_admin" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(100) NOT NULL,
    "subtitle" character varying(200),
    "image_url" "text" NOT NULL,
    "type" "text" DEFAULT 'promo'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stories_type_check" CHECK (("type" = ANY (ARRAY['promo'::"text", 'new_product'::"text"])))
);


-- VIEWS

CREATE OR REPLACE VIEW "public"."categories_with_hierarchy" AS
 SELECT "c"."id",
    "c"."name",
    "c"."slug",
    "c"."image_url",
    "c"."parent_id",
    "c"."created_at",
    "c"."sort_order",
    "c"."is_active",
    "p"."name" AS "parent_name",
    "p"."slug" AS "parent_slug",
    "p"."image_url" AS "parent_image_url",
    ("c"."parent_id" IS NULL) AS "is_root",
    ( SELECT "count"(*) AS "count"
           FROM "public"."categories"
          WHERE ("categories"."parent_id" = "c"."id")) AS "subcategory_count"
   FROM ("public"."categories" "c"
     LEFT JOIN "public"."categories" "p" ON (("c"."parent_id" = "p"."id")));


-- PRIMARY KEYS

ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_product_id_key" UNIQUE ("user_id", "product_id");

ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."otp_codes"
    ADD CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");


-- INDEXES

CREATE INDEX "idx_categories_parent_id" ON "public"."categories" USING "btree" ("parent_id");

CREATE UNIQUE INDEX "idx_categories_parent_slug" ON "public"."categories" USING "btree" ("parent_id", "slug") WHERE ("parent_id" IS NOT NULL);

CREATE INDEX "idx_categories_root" ON "public"."categories" USING "btree" ("parent_id") WHERE ("parent_id" IS NULL);

CREATE INDEX "idx_otp_phone" ON "public"."otp_codes" USING "btree" ("phone", "used", "expires_at");

CREATE UNIQUE INDEX "profiles_phone_unique_idx" ON "public"."profiles" USING "btree" ("phone") WHERE ("phone" <> ''::"text");

COMMENT ON INDEX "public"."profiles_phone_unique_idx" IS 'Гарантирует уникальность телефона. Пустые строки исключены.';


-- FOREIGN KEYS

ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


-- ROW LEVEL SECURITY

ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."otp_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;

-- addresses
CREATE POLICY "Users can modify their own addresses" ON "public"."addresses"
    USING (("auth"."uid"() = "user_id"));

-- categories
CREATE POLICY "Allow select for all" ON "public"."categories"
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON "public"."categories"
    FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));
CREATE POLICY "Admins can update categories" ON "public"."categories"
    FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));
CREATE POLICY "Admins can delete categories" ON "public"."categories"
    FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));

-- favorites
CREATE POLICY "Users can view their own favorites" ON "public"."favorites"
    FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own favorites" ON "public"."favorites"
    FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can delete their own favorites" ON "public"."favorites"
    FOR DELETE USING (("auth"."uid"() = "user_id"));

-- order_items
CREATE POLICY "Users can view their own order items." ON "public"."order_items"
    FOR SELECT USING ((EXISTS ( SELECT 1 FROM "public"."orders" WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));
CREATE POLICY "Users can insert their own order items." ON "public"."order_items"
    FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."orders" WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));
CREATE POLICY "Users can update their own order items." ON "public"."order_items"
    FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."orders" WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));
CREATE POLICY "Users can delete their own order items." ON "public"."order_items"
    FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."orders" WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));

-- orders
CREATE POLICY "Users can view their own orders." ON "public"."orders"
    FOR SELECT USING (("auth"."uid"() = "user_id"));
CREATE POLICY "Users can insert their own orders." ON "public"."orders"
    FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));
CREATE POLICY "Admins can view all orders" ON "public"."orders"
    FOR SELECT USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));
CREATE POLICY "Admins can update all orders" ON "public"."orders"
    FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));

-- products
CREATE POLICY "Products are viewable by everyone." ON "public"."products"
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON "public"."products"
    FOR INSERT WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));
CREATE POLICY "Admins can update products" ON "public"."products"
    FOR UPDATE USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));
CREATE POLICY "Admins can delete products" ON "public"."products"
    FOR DELETE USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));

-- profiles
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles"
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON "public"."profiles"
    FOR INSERT WITH CHECK (("auth"."uid"() = "id"));
CREATE POLICY "Users can update own profile." ON "public"."profiles"
    FOR UPDATE USING (("auth"."uid"() = "id"));

-- stories
CREATE POLICY "stories_select_active" ON "public"."stories"
    FOR SELECT USING ((("is_active" = true) AND (("expires_at" IS NULL) OR ("expires_at" > "now"()))));
CREATE POLICY "stories_admin_all" ON "public"."stories"
    TO "authenticated"
    USING ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))))
    WITH CHECK ((EXISTS ( SELECT 1 FROM "public"."profiles" WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));


-- GRANTS

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";

GRANT ALL ON FUNCTION "public"."select_delivery_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."select_delivery_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."select_delivery_address"("p_user_id" "uuid", "p_address_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";

GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";

GRANT ALL ON TABLE "public"."categories_with_hierarchy" TO "anon";
GRANT ALL ON TABLE "public"."categories_with_hierarchy" TO "authenticated";
GRANT ALL ON TABLE "public"."categories_with_hierarchy" TO "service_role";

GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";

GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";

GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";

GRANT ALL ON TABLE "public"."otp_codes" TO "anon";
GRANT ALL ON TABLE "public"."otp_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."otp_codes" TO "service_role";

GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."stories" TO "anon";
GRANT ALL ON TABLE "public"."stories" TO "authenticated";
GRANT ALL ON TABLE "public"."stories" TO "service_role";

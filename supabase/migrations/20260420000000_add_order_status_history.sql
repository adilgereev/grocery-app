-- Таблица истории переходов статусов заказа
CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id"              uuid        DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "order_id"        uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    "status"          public.order_status NOT NULL,
    "changed_by"      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    "changed_by_role" text        NOT NULL DEFAULT 'system',
    "note"            text,
    "created_at"      timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS
ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own order history" ON "public"."order_status_history"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
              AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins read all order history" ON "public"."order_status_history"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Триггер: авто-лог при создании заказа и при каждой смене статуса
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_status_history (order_id, status, changed_by, changed_by_role)
        VALUES (
            NEW.id,
            NEW.status,
            auth.uid(),
            CASE
                WHEN auth.uid() IS NULL       THEN 'system'
                WHEN NEW.user_id = auth.uid() THEN 'customer'
                ELSE 'admin'
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER order_status_change_trigger
    AFTER INSERT OR UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Права: клиент может перевести только свой pending-заказ в cancelled
CREATE POLICY "Customer can cancel pending order" ON "public"."orders"
    FOR UPDATE
    USING  (auth.uid() = user_id AND status = 'pending'::public.order_status)
    WITH CHECK (status = 'cancelled'::public.order_status);

-- Admins могут обновлять позиции заказа (замена товара)
CREATE POLICY "Admins update order items" ON "public"."order_items"
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Admins могут удалять позиции заказа
CREATE POLICY "Admins delete order items" ON "public"."order_items"
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Admins могут вставлять записи в историю статусов (уведомление клиенту)
CREATE POLICY "Admins insert order status history" ON "public"."order_status_history"
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

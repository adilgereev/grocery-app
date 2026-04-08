-- Добавляем недостающие политики UPDATE и DELETE для таблицы order_items.
-- Доступ разрешён только владельцу заказа (через таблицу orders).

CREATE POLICY "Users can update their own order items."
  ON public.order_items FOR UPDATE TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own order items."
  ON public.order_items FOR DELETE TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ));

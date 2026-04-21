-- Атомарная замена товара в заказе: обновляет order_items, пересчитывает total_amount, пишет в историю
CREATE OR REPLACE FUNCTION replace_order_item(
  p_item_id UUID,
  p_order_id UUID,
  p_new_product_id UUID,
  p_new_price NUMERIC,
  p_new_total NUMERIC,
  p_original_product_name TEXT,
  p_new_product_name TEXT,
  p_current_status TEXT,
  p_admin_id UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE order_items
    SET product_id = p_new_product_id, price_at_time = p_new_price
    WHERE id = p_item_id;

  UPDATE orders
    SET total_amount = p_new_total
    WHERE id = p_order_id;

  INSERT INTO order_status_history (order_id, status, changed_by, changed_by_role, note)
    VALUES (
      p_order_id,
      p_current_status::order_status,
      p_admin_id,
      'admin',
      format('Товар «%s» заменён на «%s» (не было в наличии).', p_original_product_name, p_new_product_name)
    );
END;
$$;

-- Атомарное удаление товара из заказа: удаляет строку, пересчитывает total_amount, пишет в историю
CREATE OR REPLACE FUNCTION delete_order_item(
  p_item_id UUID,
  p_order_id UUID,
  p_product_name TEXT,
  p_new_total NUMERIC,
  p_current_status TEXT,
  p_admin_id UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM order_items WHERE id = p_item_id;

  UPDATE orders
    SET total_amount = p_new_total
    WHERE id = p_order_id;

  INSERT INTO order_status_history (order_id, status, changed_by, changed_by_role, note)
    VALUES (
      p_order_id,
      p_current_status::order_status,
      p_admin_id,
      'admin',
      format('Товар «%s» удалён из заказа (не было в наличии). Сумма пересчитана.', p_product_name)
    );
END;
$$;

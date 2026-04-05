-- Функция для атомарного выбора адреса доставки (защита от race condition)

CREATE OR REPLACE FUNCTION select_delivery_address(p_user_id UUID, p_address_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

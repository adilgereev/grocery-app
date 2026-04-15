-- Убрать поле comment с таблицы addresses (не использовалось персоналом)
ALTER TABLE addresses DROP COLUMN IF EXISTS comment;

-- Добавить единое поле comment на уровне заказа
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comment TEXT;

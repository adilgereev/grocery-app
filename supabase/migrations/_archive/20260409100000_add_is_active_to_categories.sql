-- Добавляем поле is_active в таблицу categories
ALTER TABLE categories
  ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Комментарий к колонке
COMMENT ON COLUMN categories.is_active IS 'Видимость категории для покупателей. false — категория скрыта.';

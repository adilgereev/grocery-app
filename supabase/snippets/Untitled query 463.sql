-- Фиксация согласия пользователя с политикой конфиденциальности (152-ФЗ)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version     text;

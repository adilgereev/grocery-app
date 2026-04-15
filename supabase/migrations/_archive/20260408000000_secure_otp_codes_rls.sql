-- Закрываем публичный доступ к таблице otp_codes.
-- Все операции (INSERT, SELECT, UPDATE) теперь выполняются только
-- через Edge Functions с service_role, который обходит RLS.
-- Клиент с anon-ключом больше не может читать или изменять OTP-коды.

DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can read OTP" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP" ON public.otp_codes;

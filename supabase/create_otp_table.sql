-- Таблица OTP-кодов для авторизации по телефону
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Индекс для быстрого поиска по телефону
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes (phone, used, expires_at);

-- RLS: разрешаем анонимным пользователям вставлять и читать OTP-коды
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_codes;
CREATE POLICY "Anyone can insert OTP" ON public.otp_codes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read OTP" ON public.otp_codes;
CREATE POLICY "Anyone can read OTP" ON public.otp_codes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update OTP" ON public.otp_codes;
CREATE POLICY "Anyone can update OTP" ON public.otp_codes
  FOR UPDATE USING (true);

-- Автоочистка: удаляем просроченные коды старше 1 часа
-- (Можно запускать периодически через pg_cron или вручную)
-- DELETE FROM public.otp_codes WHERE expires_at < now() - interval '1 hour';

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Заголовки CORS для вызовов из мобильного клиента
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Preflight-запрос от CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Номер телефона обязателен' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Генерация 4-значного кода на сервере
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Клиент с service_role — обходит RLS, клиент его никогда не видит
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Сохраняем код в БД (TTL 5 минут)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({ phone, code, expires_at: expiresAt });

    if (insertError) throw insertError;

    // DEV-режим: SMS не отправляем, возвращаем код в ответе
    const isDev = Deno.env.get('DEV_MODE') === 'true';
    if (isDev) {
      return new Response(
        JSON.stringify({ success: true, code }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // PROD-режим: отправляем SMS через SMS.ru
    const smsApiId = Deno.env.get('SMS_RU_API_ID');
    if (!smsApiId) throw new Error('SMS_RU_API_ID не задан в переменных окружения функции');

    const message = encodeURIComponent(`Вкусная Доставка: ваш код ${code}`);
    const smsUrl = `https://sms.ru/sms/send?api_id=${smsApiId}&to=${phone}&msg=${message}&json=1`;

    const smsResponse = await fetch(smsUrl);
    const smsData = await smsResponse.json();

    if (smsData.status !== 'OK') {
      throw new Error(`SMS.ru: ${smsData.status_text || JSON.stringify(smsData)}`);
    }

    const smsInfo = smsData.sms?.[phone];
    if (smsInfo?.status !== 'OK') {
      throw new Error(`SMS.ru ошибка номера: ${smsInfo?.status_text || JSON.stringify(smsInfo)}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Неизвестная ошибка' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

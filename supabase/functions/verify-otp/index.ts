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
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Телефон и код обязательны' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Клиент с service_role — клиент никогда не читает otp_codes напрямую
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Ищем актуальный неиспользованный код
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) throw otpError;

    // Код не найден или истёк
    if (!otpData) {
      return new Response(
        JSON.stringify({ verified: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Помечаем код как использованный
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpData.id);

    if (updateError) throw updateError;

    // Создаём юзера в Auth если не существует (первый вход)
    const secretKey = Deno.env.get('AUTH_SECRET_KEY');
    if (secretKey) {
      const email = `phone${phone}@example.com`;
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(phone));
      const password = Array.from(new Uint8Array(sig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone },
      });
      // Игнорируем ошибку "уже существует" — юзер просто входит повторно
      if (createError && !createError.message.includes('already been registered')) {
        throw createError;
      }
    }

    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Неизвестная ошибка' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFY_STATUSES = ['assembled', 'shipped', 'delivered', 'cancelled'];

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  assembled: { title: 'Заказ собран 📦',     body: 'Курьер уже едет забирать заказ' },
  shipped:   { title: 'Курьер в пути 🚴',    body: 'Ваш заказ уже едет к вам'       },
  delivered: { title: 'Заказ доставлен! 🎉', body: 'Приятного аппетита!'             },
  cancelled: { title: 'Заказ отменён ❌',     body: 'Свяжитесь с поддержкой'         },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Supabase Database Webhook присылает { type, table, record, old_record }
    const payload = await req.json();
    const newStatus: string = payload.record?.status;
    const oldStatus: string = payload.old_record?.status;
    const userId: string = payload.record?.user_id;
    const orderId: string = payload.record?.id;

    if (!NOTIFY_STATUSES.includes(newStatus) || newStatus === oldStatus) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .maybeSingle();

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ skipped: 'no_token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const msg = STATUS_MESSAGES[newStatus];

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: profile.push_token,
        title: msg.title,
        body: msg.body,
        sound: 'default',
        data: { orderId },
      }),
    });

    const result = await expoResponse.json();

    // Токен устройства недействителен (переустановка приложения, смена устройства)
    if (result.data?.status === 'error' && result.data?.details?.error === 'DeviceNotRegistered') {
      await supabase.from('profiles').update({ push_token: null }).eq('id', userId);
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Неизвестная ошибка' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3';
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner';

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
    const { folder, contentType = 'image/jpeg' } = await req.json();

    if (!folder || !['products', 'categories'].includes(folder)) {
      return new Response(
        JSON.stringify({ error: 'Параметр folder обязателен: products или categories' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const r2Endpoint = Deno.env.get('R2_ENDPOINT');
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY');
    const bucket = Deno.env.get('R2_BUCKET_NAME');
    const imagekitBase = Deno.env.get('IMAGEKIT_URL_ENDPOINT');

    if (!r2Endpoint || !accessKeyId || !secretAccessKey || !bucket || !imagekitBase) {
      throw new Error('Не настроены переменные окружения R2 на сервере');
    }

    // Уникальное имя файла
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const key = `${folder}/${fileName}`;

    const client = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    // Presigned URL действует 5 минут
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });

    // Финальный CDN-адрес через ImageKit
    const cdnUrl = `${imagekitBase}/${key}`;

    return new Response(
      JSON.stringify({ uploadUrl, cdnUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Неизвестная ошибка' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

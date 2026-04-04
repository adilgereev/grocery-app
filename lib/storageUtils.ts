import { logger } from './logger';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// Конфигурация R2 из ENV
const R2_REGION = 'auto';
const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT as string;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY as string;
const R2_BUCKET = process.env.EXPO_PUBLIC_R2_BUCKET_NAME as string;
const IMAGEKIT_BASE_URL = process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT as string;

// Проверка наличия обязательных env-переменных для R2
const R2_REQUIRED_ENVS: Record<string, string | undefined> = {
  EXPO_PUBLIC_R2_ENDPOINT: R2_ENDPOINT,
  EXPO_PUBLIC_R2_ACCESS_KEY_ID: R2_ACCESS_KEY_ID,
  EXPO_PUBLIC_R2_SECRET_ACCESS_KEY: R2_SECRET_ACCESS_KEY,
  EXPO_PUBLIC_R2_BUCKET_NAME: R2_BUCKET,
  EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT: IMAGEKIT_BASE_URL,
};

const missingR2Envs = Object.entries(R2_REQUIRED_ENVS)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingR2Envs.length > 0) {
  logger.warn(`[storageUtils] Отсутствуют env-переменные для R2: ${missingR2Envs.join(', ')}. Загрузка изображений недоступна.`);
}

// Кешируем S3Client — создаётся один раз при первом вызове uploadImage
let s3ClientCache: InstanceType<typeof import('@aws-sdk/client-s3').S3Client> | null = null;

/**
 * Лениво создаёт S3Client (AWS SDK загружается только при первой загрузке файла)
 */
async function getS3Client() {
  if (s3ClientCache) return s3ClientCache;

  const { S3Client } = await import('@aws-sdk/client-s3');
  s3ClientCache = new S3Client({
    region: R2_REGION,
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
  return s3ClientCache;
}

/**
 * Загружает изображение в Cloudflare R2 и возвращает URL через ImageKit
 * @param uri Локальный путь к файлу (из image-picker)
 * @param folder Папка в бакете ('products' или 'categories')
 * @returns Публичный URL через CDN ImageKit
 */
export async function uploadImage(uri: string, folder: 'products' | 'categories'): Promise<string> {
  // Ранний возврат, если env-переменные не настроены
  if (missingR2Envs.length > 0) {
    throw new Error(`Загрузка изображений недоступна: не настроены ${missingR2Envs.join(', ')}`);
  }

  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${folder}/${fileName}`;

    // Читаем файл как base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Конвертируем в ArrayBuffer
    const arrayBuffer = decode(base64);

    // Ленивая загрузка AWS SDK и создание клиента
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = await getS3Client();

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: filePath,
      Body: new Uint8Array(arrayBuffer),
      ContentType: 'image/jpeg',
    });

    await client.send(command);

    // Возвращаем URL через ImageKit для автоматической оптимизации
    return `${IMAGEKIT_BASE_URL}/${filePath}`;
  } catch (error) {
    logger.error('Error uploading image to R2:', error);
    throw error;
  }
}

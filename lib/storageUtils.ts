import { logger } from './logger';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Конфигурация R2 из ENV
const R2_REGION = 'auto';
const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT as string;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY as string;
const R2_BUCKET = process.env.EXPO_PUBLIC_R2_BUCKET_NAME as string;
const IMAGEKIT_BASE_URL = process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT as string;

// Инициализация S3 клиента для Cloudflare R2
const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Загружает изображение в Cloudflare R2 и возвращает URL через ImageKit
 * @param uri Локальный путь к файлу (из image-picker)
 * @param folder Папка в бакете ('products' или 'categories')
 * @returns Публичный URL через CDN ImageKit
 */
export async function uploadImage(uri: string, folder: 'products' | 'categories'): Promise<string> {
  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${folder}/${fileName}`;

    // Читаем файл как base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Конвертируем в ArrayBuffer
    const arrayBuffer = decode(base64);

    // Загрузка в R2 через S3 SDK
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: filePath,
      Body: new Uint8Array(arrayBuffer),
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);

    // Возвращаем URL через ImageKit для автоматической оптимизации
    return `${IMAGEKIT_BASE_URL}/${filePath}`;
  } catch (error) {
    logger.error('Error uploading image to R2:', error);
    throw error;
  }
}

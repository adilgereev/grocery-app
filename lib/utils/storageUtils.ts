import { supabase } from '@/lib/services/supabase';
import * as FileSystem from 'expo-file-system';

/**
 * Загружает изображение в Cloudflare R2 через Supabase Edge Function (presigned URL).
 * Секретный ключ R2 никогда не покидает сервер — клиент получает только временный URL.
 * @param uri Локальный путь к файлу (из image-picker)
 * @param folder Папка в бакете ('products' или 'categories')
 * @returns Публичный URL через CDN ImageKit
 */
export async function uploadImage(uri: string, folder: 'products' | 'categories'): Promise<string> {
  // Получаем presigned PUT URL от Edge Function
  const { data, error } = await supabase.functions.invoke('get-upload-url', {
    body: { folder, contentType: 'image/jpeg' },
  });

  if (error) throw error;

  const { uploadUrl, cdnUrl } = data as { uploadUrl: string; cdnUrl: string };

  // Читаем файл как base64
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

  // Конвертируем base64 в бинарный буфер без внешних библиотек
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Загружаем напрямую в R2 по presigned URL — без AWS SDK на клиенте
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: bytes,
    headers: { 'Content-Type': 'image/jpeg' },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Ошибка загрузки в R2: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  return cdnUrl;
}

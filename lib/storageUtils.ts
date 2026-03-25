import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

/**
 * Загружает изображение в Supabase Storage
 * @param uri Локальный путь к файлу (из image-picker)
 * @param folder Папка в бакете ('products' или 'categories')
 * @returns Публичный URL загруженного файла
 */
export async function uploadImage(uri: string, folder: 'products' | 'categories'): Promise<string> {
  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `${folder}/${fileName}`;

    // Читаем файл как base64 (наиболее надежный способ для Expo + Supabase)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Конвертируем в ArrayBuffer (Supabase ожидает тело файла)
    const arrayBuffer = decode(base64);

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    // Получаем публичную ссылку
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

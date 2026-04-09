import { supabase } from '@/lib/supabase';

// Загрузка изображения через presigned URL в R2, возвращает CDN URL
export async function uploadImage(file: File, folder: 'products' | 'categories'): Promise<string> {
  const { data, error } = await supabase.functions.invoke('get-upload-url', {
    body: { folder, contentType: file.type || 'image/jpeg' },
  });

  if (error) throw error;

  const { uploadUrl, cdnUrl } = data as { uploadUrl: string; cdnUrl: string };

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'image/jpeg' },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Ошибка загрузки изображения: ${uploadResponse.statusText}`);
  }

  return cdnUrl;
}

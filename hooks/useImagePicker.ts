import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/lib/utils/storageUtils';
import { showAlert } from '@/lib/utils/platformUtils';

type StorageBucket = 'products' | 'categories';

interface UseImagePickerResult {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  uploading: boolean;
  pickImage: () => Promise<void>;
}

/**
 * Хук для выбора и загрузки изображения из галереи.
 * Управляет состоянием imageUrl и флагом uploading.
 */
export function useImagePicker(bucket: StorageBucket): UseImagePickerResult {
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setUploading(true);
      try {
        const publicUrl = await uploadImage(result.assets[0].uri, bucket);
        setImageUrl(publicUrl);
      } catch {
        showAlert('Ошибка', 'Не удалось загрузить изображение');
      } finally {
        setUploading(false);
      }
    }
  }, [bucket]);

  return { imageUrl, setImageUrl, uploading, pickImage };
}

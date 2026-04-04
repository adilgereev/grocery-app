import { getOptimizedImage, getPlaceholderUrl, ImageOptions } from '@/utils/imageKit';
import { useMemo } from 'react';

interface UseImageKitOptions {
  width: number;
  height: number;
  transition?: number;
  imageOptions?: Omit<ImageOptions, 'width' | 'height'>;
}

interface UseImageKitReturn {
  source: string;
  placeholder: string;
  hasImage: boolean;
  /** Общие пропсы для expo-image <Image> */
  imageProps: {
    contentFit: 'cover';
    transition: number;
  };
}

/**
 * Хук для стандартизации загрузки изображений через ImageKit.
 * Объединяет getOptimizedImage + getPlaceholderUrl + общие пропсы.
 */
export function useImageKit(
  url: string | null | undefined,
  options: UseImageKitOptions,
): UseImageKitReturn {
  const { width, height, transition = 300, imageOptions } = options;

  return useMemo(() => {
    const source = getOptimizedImage(url, { width, height, ...imageOptions });
    const placeholder = getPlaceholderUrl(url);

    return {
      source,
      placeholder,
      hasImage: !!url,
      imageProps: {
        contentFit: 'cover' as const,
        transition,
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, width, height, transition]);
}

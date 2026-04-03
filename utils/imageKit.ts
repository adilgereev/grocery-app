import { PixelRatio } from 'react-native';

/**
 * Утилита для продвинутой оптимизации изображений через ImageKit
 * Документация: https://imagekit.io/docs/image-transformation
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  smartCrop?: boolean; // фокус на объекте (fo-auto)
  format?: 'auto' | 'webp' | 'png' | 'jpg'; // f-auto
  blur?: number; // размытие (bl-X)
  dpr?: number | 'auto'; // плотность пикселей (dpr-X)
  background?: string; // цвет фона без # (bg-XXXXXX)
  padding?: number; // отступы (p-X)
  customTransformations?: string; // ручные параметры из базы (напр. fo-bottom)
  v?: number | string; // версия для сброса кеша
}

/**
 * Генерирует URL с параметрами трансформации для ImageKit
 */
export function getOptimizedImage(url: string | null | undefined, options: ImageOptions = {}): string {
  if (!url) return '';

  // Если это не ImageKit URL, возвращаем как есть
  if (!url.includes('ik.imagekit.io')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    smartCrop = false,
    format = 'auto',
    blur,
    dpr = 'auto',
    background,
    padding,
    customTransformations,
    v,
  } = options;

  const transforms: string[] = [];

  // Базовые размеры
  if (width) transforms.push(`w-${width}`);
  if (height) transforms.push(`h-${height}`);
  
  // Качество и формат
  if (quality) transforms.push(`q-${quality}`);
  if (format) transforms.push(`f-${format}`);

  // Продвинутые параметры
  if (smartCrop && !customTransformations?.includes('fo-')) {
    transforms.push('fo-auto');
  }
  if (blur) transforms.push(`bl-${blur}`);
  if (background) transforms.push(`bg-${background.replace('#', '')}`);
  if (padding) transforms.push(`p-${padding}`);
  if (customTransformations) transforms.push(customTransformations);

  // DPR для Retina-дисплеев
  if (dpr === 'auto') {
    const screenDpr = Math.floor(PixelRatio.get());
    transforms.push(`dpr-${screenDpr > 1 ? screenDpr : 1}`);
  } else if (dpr) {
    transforms.push(`dpr-${dpr}`);
  }

  if (transforms.length === 0) return url;

  const transformString = `tr=${transforms.join(',')}`;
  let finalUrl = url.includes('?') ? `${url}&${transformString}` : `${url}?${transformString}`;

  // Добавляем версию для сброса кеша
  if (v) {
    finalUrl = `${finalUrl}&v=${v}`;
  }

  return finalUrl;
}

/**
 * Генерирует URL для микро-превью (LQIP), которое загружается мгновенно
 * @param url Исходный URL
 * @returns Очень маленькая размытая картинка
 */
export function getPlaceholderUrl(url: string | null | undefined): string {
  if (!url) return '';
  return getOptimizedImage(url, { 
    width: 20, 
    quality: 10, 
    blur: 5,
    format: 'webp' 
  });
}

import { DaDataSuggestion, getAddressByCoords } from '@/lib/api/dadataApi';
import { logger } from '@/lib/utils/logger';

/**
 * Вспомогательная функция для красивого форматирования адреса из подсказки DaData
 */
export const formatAddressString = (suggestion: DaDataSuggestion): string => {
  const data = suggestion.data;
  if (!data.street_with_type) return suggestion.value;

  if (data.house) {
    return `${data.street_with_type}, д. ${data.house}`;
  }
  return data.street_with_type;
};

/**
 * Очищает строку адреса от лишних префиксов города, региона и (опционально) номера дома.
 */
interface ResolvedAddress {
  text: string;
  house?: string;
}

export const resolveAddressFromCoords = async (
  lat: number,
  lon: number
): Promise<ResolvedAddress | null> => {
  try {
    const suggestion = await getAddressByCoords(lat, lon);
    if (!suggestion) return null;
    return {
      text: formatAddressString(suggestion),
      house: suggestion.data.house,
    };
  } catch (e) {
    logger.error('Ошибка реверсивного геокодинга:', e);
    return null;
  }
};

export const cleanAddress = (raw: string, options: { removeHouse?: boolean } = {}): string => {
  if (!raw) return '';
  
  let clean = raw
    .replace(/^г\. Буйнакск,?\s*/i, '')
    .replace(/,?\s*Республика Дагестан$/i, '')
    .replace(/,?\s*Респ\. Дагестан$/i, '');
    
  if (options.removeHouse) {
    // Полностью убираем «д. N» и всё что за ним
    clean = clean.replace(/,?\s*д\.\s*\d+.*$/i, '');
  } else {
    // Убираем дубликат «д. N» если встречается дважды (из старого address.ts)
    clean = clean.replace(/(д\.\s*\d+[^,]*),.*?\1/i, '$1');
  }
    
  return clean.trim();
};

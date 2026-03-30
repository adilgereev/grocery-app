import { DaDataSuggestion } from './dadataApi';

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
 * Очищает строку адреса от лишних префиксов города и региона
 */
export const cleanAddressStreet = (rawAddress: string): string => {
  return rawAddress
    .replace(/^г\. Буйнакск,?\s*/i, '')
    .replace(/,?\s*Республика Дагестан$/i, '')
    .replace(/,?\s*Респ\. Дагестан$/i, '')
    .replace(/,?\s*д\.\s*\d+.*$/i, '')
    .trim();
};

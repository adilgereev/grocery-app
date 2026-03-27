import { Address } from '@/store/addressStore';

/**
 * Очищает название улицы от города Буйнакск и системных префиксов
 */
const cleanStreetName = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^г\. Буйнакск, /, '')
    .replace(/, Республика Дагестан$/, '')
    .trim();
};

/**
 * Короткий формат: Улица + Дом (для Шапки главной)
 * Пример: ул. Орджоникидзе, д. 5
 */
export const formatShortAddress = (addr: Address | null | undefined): string => {
  if (!addr) return 'Выберите адрес';
  
  const street = cleanStreetName(addr.text);
  const parts = [street];
  
  if (addr.house) {
    parts.push(`д. ${addr.house}`);
  }
  
  return parts.join(', ');
};

/**
 * Полный формат: Улица, Дом, Квартира, Подъезд, Этаж (для Корзины, Списка и Заказов)
 * Пример: ул. Орджоникидзе, д. 56, кв. 12, под. 2, эт. 4
 */
export const formatFullAddress = (addr: Address | null | undefined): string => {
  if (!addr) return '';
  
  const street = cleanStreetName(addr.text);
  const parts = [street];
  
  if (addr.house) parts.push(`д. ${addr.house}`);
  if (addr.apartment) parts.push(`кв. ${addr.apartment}`);
  if (addr.entrance) parts.push(`под. ${addr.entrance}`);
  if (addr.floor) parts.push(`эт. ${addr.floor}`);
  
  return parts.join(', ');
};

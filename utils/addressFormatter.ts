import { Address } from '@/types';
import { cleanAddress } from '@/lib/addressUtils';

/**
 * Короткий формат: Улица + Дом (для Шапки главной)
 * Пример: ул. Орджоникидзе, д. 5
 */
export const formatShortAddress = (addr: Address | null | undefined): string => {
  if (!addr) return 'Выберите адрес';
  
  const street = cleanAddress(addr.text, { removeHouse: true });
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
  
  const street = cleanAddress(addr.text, { removeHouse: true });
  const parts = [street];
  
  if (addr.house) parts.push(`д. ${addr.house}`);
  if (addr.apartment) parts.push(`кв. ${addr.apartment}`);
  if (addr.entrance) parts.push(`под. ${addr.entrance}`);
  if (addr.floor) parts.push(`эт. ${addr.floor}`);
  
  return parts.join(', ');
};

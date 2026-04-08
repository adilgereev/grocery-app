// Утилиты для работы с номером телефона

/**
 * Нормализация номера телефона (убираем всё кроме цифр, добавляем 7)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('8') && digits.length === 11) {
    return '7' + digits.slice(1);
  }
  if (digits.startsWith('+7')) {
    return digits.slice(1);
  }
  if (digits.startsWith('7') && digits.length === 11) {
    return digits;
  }
  return digits;
}

/**
 * Форматирование номера для отображения: +7 (900) 123-45-67
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length !== 11) return phone;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}



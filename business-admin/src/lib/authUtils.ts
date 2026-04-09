import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

// Нормализация номера телефона (убираем всё кроме цифр, приводим к 7XXXXXXXXXX)
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

// Форматирование номера для отображения: +7 (900) 123-45-67
export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length !== 11) return phone;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

// Генерация детерминированного пароля из номера телефона через HMAC-SHA256
export function generatePasswordFromPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  const secretKey = import.meta.env.VITE_AUTH_SECRET_KEY as string;

  if (!secretKey) {
    throw new Error('VITE_AUTH_SECRET_KEY is not defined in .env.local');
  }

  const hash = hmacSHA256(normalized, secretKey);
  return hash.toString(Hex);
}

// Генерация email-заглушки из номера телефона для Supabase Auth
export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  return `phone${normalized}@example.com`;
}

import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';
import { normalizePhone } from '@/lib/services/sms';

/**
 * Генерация детерминированного, но криптографически безопасного пароля из номера телефона.
 * Используется алгоритм HMAC-SHA256 с секретным ключом.
 * Невозможно подобрать пароль, не зная серверного EXPO_PUBLIC_AUTH_SECRET_KEY.
 */
export function generatePasswordFromPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  const secretKey = process.env.EXPO_PUBLIC_AUTH_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('EXPO_PUBLIC_AUTH_SECRET_KEY is not defined in .env');
  }

  // Генерируем хэш и преобразуем в 64-символьную hex-строку
  const hash = hmacSHA256(normalized, secretKey);
  return hash.toString(Hex);
}

/**
 * Генерация email-заглушки из номера телефона
 * (Supabase Auth требует email, мы создаём виртуальный)
 */
export function phoneToEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  // example.com — зарезервированный RFC 2606 домен, Supabase его принимает
  return `phone${normalized}@example.com`;
}

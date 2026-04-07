// Сервис отправки SMS через SMS.ru API
const SMS_RU_API_ID = process.env.EXPO_PUBLIC_SMS_RU_API_ID;

/**
 * Генерация случайного 4-значного OTP кода
 */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

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

/**
 * Отправка SMS через SMS.ru API
 * Возвращает объект с результатом и деталями ошибки
 */
export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!SMS_RU_API_ID) {
    return { success: false, error: 'EXPO_PUBLIC_SMS_RU_API_ID не задан в .env' };
  }

  try {
    const normalizedPhone = normalizePhone(phone);
    const url = `https://sms.ru/sms/send?api_id=${SMS_RU_API_ID}&to=${normalizedPhone}&msg=${encodeURIComponent(message)}&json=1`;

    const response = await fetch(url);
    const text = await response.text();

    let data: { status: string; status_text?: string; sms?: Record<string, { status: string; status_text?: string }> } | null = null;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: `Ответ SMS.ru (не JSON): ${text.substring(0, 200)}` };
    }

    // SMS.ru возвращает status === 'OK' при общем успехе
    if (data && data.status === 'OK') {
      // Проверяем статус конкретного номера
      const smsInfo = data.sms?.[normalizedPhone];
      if (smsInfo?.status === 'OK') {
        return { success: true };
      }
      // Если статус номера не OK — достаём описание ошибки
      return { success: false, error: `SMS.ru ошибка номера: ${smsInfo?.status_text || JSON.stringify(smsInfo)}` };
    }

    if (!data) {
      return { success: false, error: 'Не удалось получить ответ от SMS.ru' };
    }

    return { success: false, error: `SMS.ru: ${data.status_text || JSON.stringify(data)}` };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная сетевая ошибка';
    return { success: false, error: `Сетевая ошибка: ${errorMessage}` };
  }
}


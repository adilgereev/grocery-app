/**
 * Логгер для «цивилизованной» отладки.
 * В режиме разработки (__DEV__) выводит сообщения в консоль.
 * В продакшне — ничего не делает (или может отправлять ошибки в Sentry).
 * Используем unknown[] вместо any[] — безопасный вариант для variadic-аргументов.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (__DEV__) {
      console.error(...args);
    }
    // Здесь в будущем можно добавить:
    // Sentry.captureException(args[0]);
  },
  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
};

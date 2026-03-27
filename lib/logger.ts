/**
 * Логгер для «цивилизованной» отладки.
 * В режиме разработки (__DEV__) выводит сообщения в консоль.
 * В продакшне — ничего не делает (или может отправлять ошибки в Sentry).
 */
export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    }
    // Здесь в будущем можно добавить:
    // Sentry.captureException(args[0]);
  },
  info: (...args: any[]) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
};

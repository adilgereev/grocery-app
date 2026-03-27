/**
 * Очистка адреса для отображения:
 * - Убирает город и регион
 * - Убирает дублирование номера дома
 */
export function cleanAddress(raw: string): string {
  let clean = raw
    .replace(/^г\. Буйнакск,?\s*/, '')
    .replace(/,?\s*Республика Дагестан$/, '')
    .replace(/,?\s*Респ\. Дагестан$/, '');

  // Убираем дубликат «д. N» если встречается дважды
  clean = clean.replace(/(д\.\s*\d+[^,]*),.*?\1/, '$1');

  return clean.trim();
}

/**
 * Прецизионный расчет сетки "Метод Лавки".
 * Рассчитывает ширину карточек в пикселях на основе ширины контейнера и фиксированного зазора.
 */
export function getMosaicCardWidth(
  index: number, 
  totalItems: number, 
  containerWidth: number, 
  gap: number = 8
): number {
  const unitWidth = (containerWidth - gap * 2) / 3;

  const hasOrphan = totalItems % 2 !== 0 && totalItems >= 3;
  const isInLastThreeOfOdd = hasOrphan && index >= totalItems - 3;

  // Ряд из 3 маленьких карточек
  if (isInLastThreeOfOdd) {
    return unitWidth;
  } 
  
  if (index === totalItems - 1 && totalItems === 1) {
    return containerWidth;
  }

  const rowIndex = Math.floor(index / 2);
  const isFirstInPair = index % 2 === 0;

  if (rowIndex % 2 === 0) {
    // Строка 1, 3, 5... (Широкий-Узкий)
    return isFirstInPair ? unitWidth * 2 + gap : unitWidth;
  } else {
    // Строка 2, 4, 6... (Узкий-Широкий)
    return isFirstInPair ? unitWidth : unitWidth * 2 + gap;
  }
}

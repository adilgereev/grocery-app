import { DimensionValue } from 'react-native';

/**
 * Алгоритм "Живой Мозаики" (Лавка-стайл).
 * Строит сетку: Широкий-Узкий -> Узкий-Широкий.
 * Если элементов нечетное кол-во (и их >= 3), то последние 3 делаются узкими ('32%') в один ряд.
 * Если элемент один во всем списке, он занимает '100%'.
 * По умолчанию используется '48.5%' для ровных колонок.
 */
export function getMosaicCardWidth(index: number, totalItems: number): DimensionValue {
  const hasOrphan = totalItems % 2 !== 0 && totalItems >= 3;
  const isInLastThreeOfOdd = hasOrphan && index >= totalItems - 3;

  if (isInLastThreeOfOdd) {
    return '32%';
  } 
  
  if (index === totalItems - 1 && totalItems === 1) {
    return '100%';
  }

  const rowIndex = Math.floor(index / 2);
  const isFirstInPair = index % 2 === 0;

  if (rowIndex % 2 === 0) {
    // Строка 1, 3, 5... (Широкий-Узкий)
    return isFirstInPair ? '60%' : '37%';
  } else {
    // Строка 2, 4, 6... (Узкий-Широкий)
    return isFirstInPair ? '37%' : '60%';
  }
}

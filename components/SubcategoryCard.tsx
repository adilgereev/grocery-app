import { Radius, Spacing, Colors } from '@/constants/theme';
import { Category } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, DimensionValue } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SubcategoryCardProps {
  subcategory: Category;
  index: number;
  totalItems: number;
}

const SubcategoryCard = React.memo(({ subcategory, index, totalItems }: SubcategoryCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    // Навигация на страницу продуктов подкатегории
    router.push(`/category/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`);
  };

  // Алгоритм Живой Мозаики (Лавка-стайл: Широкий-Узкий -> Узкий-Широкий)
  // Если элементов нечетное кол-во (и их >= 3), то последние 3 делаем узкими в один ряд
  const hasOrphan = totalItems % 2 !== 0 && totalItems >= 3;
  const isInLastThreeOfOdd = hasOrphan && index >= totalItems - 3;

  let cardWidth: DimensionValue = '48.5%'; // Дефолт (две колонки)

  if (isInLastThreeOfOdd) {
    cardWidth = '32%'; // Три в ряд в конце мозаики
  } else if (index === totalItems - 1 && totalItems === 1) {
    cardWidth = '100%'; // Единственный элемент в списке
  } else {
    const rowIndex = Math.floor(index / 2);
    const isFirstInPair = index % 2 === 0;

    if (rowIndex % 2 === 0) {
      // Строка 1, 3, 5... (Широкий-Узкий)
      cardWidth = isFirstInPair ? '60%' : '37%';
    } else {
      // Строка 2, 4, 6... (Узкий-Широкий)
      cardWidth = isFirstInPair ? '37%' : '60%';
    }
  }

  // Цвет фона: из базы (HEX) или нейтральный дефолт
  const isHex = subcategory.image_url?.startsWith('#');
  const bgColor = isHex ? subcategory.image_url : Colors.light.background;

  return (
    <AnimatedTouchable
      testID="subcategory-card"
      style={[styles.card, { width: cardWidth, backgroundColor: bgColor as string }]}
      activeOpacity={0.85}
      onPress={handlePress}
      entering={FadeInDown.delay((index % 5) * 50).duration(400)}
    >
      <Text style={styles.categoryName} numberOfLines={3}>{subcategory.name}</Text>

      {subcategory.image_url && !isHex && (
        <Image
          source={{ uri: subcategory.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </AnimatedTouchable>
  );
});
SubcategoryCard.displayName = 'SubcategoryCard';

export default SubcategoryCard;

const styles = StyleSheet.create({
  card: {
    height: 110,
    borderRadius: Radius.l,
    overflow: 'hidden',
  },
  categoryName: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '800',
    padding: Spacing.s,
    lineHeight: 18,
    maxWidth: '85%',
    zIndex: 10,
  },
  image: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    width: 65,
    height: 65,
  },
});

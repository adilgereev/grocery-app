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
}

const SubcategoryCard = React.memo(({ subcategory, index }: SubcategoryCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    // Навигация на страницу продуктов подкатегории
    router.push(`/category/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`);
  };

  // Мозаичная сетка (5 элементов = 1 блок паттерна)
  const patternIndex = index % 5;
  let cardWidth: DimensionValue = '31%';
  if (patternIndex === 0) cardWidth = '58%';
  if (patternIndex === 1) cardWidth = '38%';

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

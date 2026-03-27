import { Radius, Spacing } from '@/constants/theme';
import { Category } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SubcategoryCardProps {
  subcategory: Category;
  index: number;
}

const PASTEL_COLORS = [
  '#E0F2FE', // light blue
  '#FEF3C7', // light yellow
  '#F0FDF4', // light green
  '#FFE4E6', // light pink
  '#F3E8FF', // light purple
  '#FFEDD5', // light orange
];

const SubcategoryCard = React.memo(({ subcategory, index }: SubcategoryCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    // Навигация на страницу продуктов подкатегории
    router.push(`/category/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`);
  };

  // Мозаичная сетка (5 элементов = 1 блок паттерна)
  const patternIndex = index % 5;
  let cardWidth: `${number}%` = '31%';
  if (patternIndex === 0) cardWidth = '58%';
  if (patternIndex === 1) cardWidth = '38%';

  const bgColor = PASTEL_COLORS[index % PASTEL_COLORS.length];

  return (
    <AnimatedTouchable
      style={[styles.card, { width: cardWidth, backgroundColor: bgColor }]}
      activeOpacity={0.85}
      onPress={handlePress}
      entering={FadeInDown.delay((index % 5) * 50).duration(400)}
    >
      <Text style={styles.categoryName} numberOfLines={3}>{subcategory.name}</Text>

      {subcategory.image_url && !subcategory.image_url.startsWith('#') && (
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
    color: '#111827',
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

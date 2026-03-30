import { Colors, Radius, Spacing } from '@/constants/theme';
import { Category } from '@/types';
import { getMosaicCardWidth } from '@/utils/mosaicLayout';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
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
  // Строгая логика была вынесена в getMosaicCardWidth (utils/mosaicLayout)
  const cardWidth = getMosaicCardWidth(index, totalItems);

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

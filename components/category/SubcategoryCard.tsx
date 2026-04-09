import { Colors, Radius, Duration, Spacing } from '@/constants/theme';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';
import { getOptimizedImage, getPlaceholderUrl } from '@/lib/utils/imageKit';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Высота карточки подкатегории
const SUBCATEGORY_CARD_HEIGHT = 118;

interface SubcategoryCardProps {
  subcategory: Category;
  cardWidth: number;
  index: number;
  onPress: () => void;
}

const SubcategoryCard = React.memo(({ subcategory, cardWidth, index, onPress }: SubcategoryCardProps) => {
  const lastFetch = useCategoryStore((state) => state.lastFetch);

  // Цвет фона: из базы (HEX) или нейтральный дефолт
  const isHex = subcategory.image_url?.startsWith('#');
  const bgColor = isHex ? subcategory.image_url : Colors.light.background;

  return (
    <AnimatedTouchable
      testID="subcategory-card"
      style={[styles.card, { width: cardWidth, backgroundColor: bgColor as string }]}
      activeOpacity={0.8}
      onPress={onPress}
      entering={FadeInDown.delay((index % 5) * 50).duration(Duration.default)}
    >
      {subcategory.image_url && !isHex && (
        <Image
          source={getOptimizedImage(subcategory.image_url, {
            width: Math.round(cardWidth),
            height: SUBCATEGORY_CARD_HEIGHT,
            customTransformations: subcategory.image_transformations || undefined,
            v: lastFetch ?? undefined
          })}
          placeholder={getPlaceholderUrl(subcategory.image_url)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          placeholderContentFit="cover"
          transition={Duration.default}
        />
      )}

      <Text style={styles.categoryName} numberOfLines={3}>
        {subcategory.name}
      </Text>
    </AnimatedTouchable>
  );
});
SubcategoryCard.displayName = 'SubcategoryCard';

export default SubcategoryCard;

const styles = StyleSheet.create({
  card: {
    height: SUBCATEGORY_CARD_HEIGHT,
    borderRadius: Radius.l,
    overflow: 'hidden',
  },
  categoryName: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '700',
    padding: Spacing.sm,
    lineHeight: 15,
    maxWidth: '90%',
    zIndex: 10,
  },
});

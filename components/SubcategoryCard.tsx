import { Colors, Radius } from '@/constants/theme';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';
import { getOptimizedImage, getPlaceholderUrl } from '@/utils/imageKit';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Высота карточки подкатегории
const SUBCATEGORY_CARD_HEIGHT = 118;

interface SubcategoryCardProps {
  subcategory: Category;
  cardWidth: number;
  index: number;
}

const SubcategoryCard = React.memo(({ subcategory, cardWidth, index }: SubcategoryCardProps) => {
  const router = useRouter();
  const lastFetch = useCategoryStore((state) => state.lastFetch);
  const { width: windowWidth } = useWindowDimensions();

  const handlePress = () => {
    // Навигация на страницу продуктов подкатегории
    router.push(`/category/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`);
  };

  // Цвет фона: из базы (HEX) или нейтральный дефолт
  const isHex = subcategory.image_url?.startsWith('#');
  const bgColor = isHex ? subcategory.image_url : Colors.light.background;

  // Если карточка занимает больше 40% экрана, считаем её "широкой"
  const isWide = cardWidth > windowWidth * 0.4;
  let mergedTransformations = subcategory.image_transformations || '';
  if (isWide && !mergedTransformations.includes('cm-pad_resize')) {
    mergedTransformations = mergedTransformations
      ? `${mergedTransformations},cm-pad_resize`
      : 'cm-pad_resize';
  }

  return (
    <AnimatedTouchable
      testID="subcategory-card"
      style={[styles.card, { width: cardWidth, backgroundColor: bgColor as string }]}
      activeOpacity={0.8}
      onPress={handlePress}
      entering={FadeInDown.delay((index % 5) * 50).duration(400)}
    >
      {subcategory.image_url && !isHex && (
        <Image
          source={getOptimizedImage(subcategory.image_url, {
            width: Math.round(cardWidth),
            height: SUBCATEGORY_CARD_HEIGHT,
            customTransformations: mergedTransformations || undefined,
            v: lastFetch ?? undefined
          })}
          placeholder={getPlaceholderUrl(subcategory.image_url)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          placeholderContentFit="cover"
          transition={400}
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
    padding: 12, // Финальная настройка под Лавку
    lineHeight: 15,
    maxWidth: '90%',
    zIndex: 10,
  },
});

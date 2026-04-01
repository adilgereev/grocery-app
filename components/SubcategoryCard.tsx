import { Colors, Radius } from '@/constants/theme';
import { Category } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SubcategoryCardProps {
  subcategory: Category;
  cardWidth: number;
  index: number;
}

const SubcategoryCard = React.memo(({ subcategory, cardWidth, index }: SubcategoryCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    // Навигация на страницу продуктов подкатегории
    router.push(`/category/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`);
  };


  // Цвет фона: из базы (HEX) или нейтральный дефолт
  const isHex = subcategory.image_url?.startsWith('#');
  const bgColor = isHex ? subcategory.image_url : Colors.light.background;

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
          source={{ uri: subcategory.image_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
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
    height: 118, // Высота по стандарту Лавки
    borderRadius: Radius.l,
    overflow: 'hidden',
  },
  categoryName: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '700',
    padding: 12, // Финальная настройка под Лавку
    lineHeight: 16,
    maxWidth: '90%',
    zIndex: 10,
  },
});

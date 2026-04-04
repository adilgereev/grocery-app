import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Product } from '@/types';
import { useImageKit } from '@/hooks/useImageKit';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductCard({ item, index = 0 }: { item: Product, index?: number }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const cardWidth = useMemo(() => Math.round((width - 32 - 16) / 2), [width]);
  const { source, placeholder, hasImage, imageProps } = useImageKit(
    item.image_url,
    { width: cardWidth, height: cardWidth, transition: 400 },
  );

  const { items, addItem, updateQuantity } = useCartStore();

  const cartItem = items.find((i) => i.product.id === item.id);

  return (
    <AnimatedTouchable 
      style={[styles.productCard, { width: cardWidth }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item.id}?name=${encodeURIComponent(item.name)}`)}
      entering={FadeInDown.delay(index * 50).duration(400)}
      testID="product-card"
    >
      {hasImage ? (
        <Image
          source={source}
          placeholder={placeholder}
          style={styles.productImage}
          {...imageProps}
        />
      ) : (
        <View style={[styles.productImage, { backgroundColor: Colors.light.border }]} />
      )}
      
      <View style={styles.productInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice} numberOfLines={1}>
             {Number(item.price).toFixed(0)} ₽
          </Text>
          <Text style={styles.productUnit}>/ {item.unit}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      </View>
      
      <View style={styles.actionContainer}>
        {!cartItem ? (
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.7} 
            onPress={() => addItem(item)}
            testID="product-add-button"
          >
            <Ionicons name="cart" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControlContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
              testID="product-decrease-button"
            >
              <Ionicons name="remove" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
            
            <Text style={styles.controlQuantity} testID="product-quantity-text">{cartItem.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
              testID="product-increase-button"
            >
              <Ionicons name="add" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'column',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.03, // Минималистичная, почти невидимая тень
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 0, // Убираем жесткий Android-объем
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.l,
    marginBottom: Spacing.s,
    backgroundColor: Colors.light.borderLight,
  },
  productInfo: {
    flex: 1,
    marginBottom: Spacing.s,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700', // Облегченное начертание (Soft Bold)
    color: Colors.light.text,
  },
  productUnit: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginLeft: 4,
    fontWeight: '600',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 'auto',
  },
  addButton: {
    width: '100%',
    height: 40,
    borderRadius: Radius.pill, // "Пухлая" кнопка
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControlContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill, // Синхронизируем с кнопкой
    height: 40,
    paddingHorizontal: Spacing.xs,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill, // Круглые кнопки "+" и "-"
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.card,
    marginHorizontal: Spacing.xs,
  },
});

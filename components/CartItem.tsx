import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Duration, Shadows } from '@/constants/theme';
import Animated, { FadeInLeft, Layout } from 'react-native-reanimated';
import { Product } from '@/types';
import { useRouter } from 'expo-router';
import { useImageKit } from '@/hooks/useImageKit';

interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
  };
  index: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, index, onUpdateQuantity, onRemove }) => {
  const router = useRouter();
  const { source, placeholder, hasImage, imageProps } = useImageKit(item.product.image_url, { width: 60, height: 60 });

  const handleProductPress = () => {
    router.push(`/product/${item.product.id}?name=${encodeURIComponent(item.product.name)}`);
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 50).duration(Duration.default)}
      layout={Layout.springify()}
      style={styles.container}
      testID="cart-item"
    >
      <TouchableOpacity
        style={styles.itemTouchRow}
        activeOpacity={0.7}
        onPress={handleProductPress}
        testID="cart-item-touchable"
      >
        {hasImage ? (
          <Image
            source={source}
            placeholder={placeholder}
            style={styles.itemImage}
            {...imageProps}
          />
        ) : (
          <View style={[styles.itemImage, styles.imagePlaceholder]} />
        )}

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
          <Text style={styles.itemPrice}>
            {(Number(item.product.price) * item.quantity).toFixed(0)} ₽
          </Text>
          {item.quantity > 1 && (
            <Text style={styles.itemUnitInfo}>
              {Number(item.product.price)} ₽ / шт
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.quantityControl}>
        <TouchableOpacity 
          style={styles.circleButton} 
          onPress={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          testID="quantity-decrease"
        >
          <Ionicons name="remove" size={16} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.quantityText} testID="quantity-text">{item.quantity}</Text>

        <TouchableOpacity 
          style={styles.circleButton} 
          onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          testID="quantity-increase"
        >
          <Ionicons name="add" size={16} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onRemove(item.product.id)}
        testID="remove-item"
      >
        <Ionicons name="trash-outline" size={22} color={Colors.light.error} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 12,
    ...Shadows.md,
  },
  itemTouchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  imagePlaceholder: { 
    backgroundColor: Colors.light.borderLight 
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 20, // Экстремальное скругление по-Лавке
    marginRight: Spacing.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  itemUnitInfo: { 
    fontSize: 12, 
    color: Colors.light.textLight, 
    marginTop: 2 
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginRight: 12,
  },
  circleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    color: Colors.light.text,
    minWidth: 12,
    textAlign: 'center',
  },
  deleteButton: {
    padding: Spacing.s,
  },
});

export default CartItem;

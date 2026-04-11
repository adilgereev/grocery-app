import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Duration, FontSize } from '@/constants/theme';
import Animated, { FadeInLeft, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { Product } from '@/types';
import { useImageKit } from '@/hooks/useImageKit';

interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
  };
  index: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onPress: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, index, onUpdateQuantity, onPress }) => {
  const { source, placeholder, hasImage, imageProps } = useImageKit(item.product.image_url, {
    width: 60,
    height: 60,
    imageOptions: { pad: true, background: Colors.light.card }
  });

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 50).duration(Duration.default)}
      exiting={FadeOutLeft.duration(Duration.fast)}
      layout={LinearTransition.springify()}
      style={styles.container}
      testID="cart-item"
    >
      <TouchableOpacity
        style={styles.itemTouchRow}
        activeOpacity={0.7}
        onPress={onPress}
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
          <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
          <Text style={styles.itemUnit}>{item.product.unit}</Text>
          <Text style={styles.itemPrice}>
            {(Number(item.product.price) * item.quantity).toFixed(0)} ₽
          </Text>
          {item.quantity > 1 && (
            <Text style={styles.itemUnitInfo}>
              {Number(item.product.price)} ₽ / {item.product.unit}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Счётчик без кружочков: − и + прямо на капсуле */}
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="quantity-decrease"
        >
          <Ionicons name="remove" size={18} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.quantityText} testID="quantity-text">{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="quantity-increase"
        >
          <Ionicons name="add" size={18} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Простой ряд без карточного стиля — фон и скругление от родительского itemsCard
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  itemTouchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imagePlaceholder: {
    backgroundColor: Colors.light.borderLight,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    marginRight: Spacing.m,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: FontSize.s,
    color: Colors.light.textLight,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    fontSize: FontSize.m,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemUnitInfo: {
    fontSize: FontSize.xs,
    color: Colors.light.textLight,
    marginTop: 2,
  },
  // Капсула счётчика без внутренних кружочков
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
  },
  quantityButton: {
    padding: Spacing.xs,
  },
  quantityText: {
    fontSize: FontSize.m,
    fontWeight: '700',
    marginHorizontal: Spacing.sm,
    color: Colors.light.text,
    minWidth: 12,
    textAlign: 'center',
  },
});

export default CartItem;

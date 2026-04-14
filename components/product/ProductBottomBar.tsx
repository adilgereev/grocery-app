import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductBottomBarProps {
  product: Product;
  quantity: number;
  onAddToCart: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
}

/**
 * Нижняя панель с ценой и управлением корзиной
 */
export const ProductBottomBar: React.FC<ProductBottomBarProps> = ({
  product,
  quantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const handleAddToCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToCart();
  }, [onAddToCart]);

  const handleDecrease = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateQuantity(quantity - 1);
  }, [onUpdateQuantity, quantity]);

  const handleIncrease = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdateQuantity(quantity + 1);
  }, [onUpdateQuantity, quantity]);

  return (
    <View style={styles.bottomBar}>
      <View>
        <Text style={styles.priceLabel}>Цена</Text>
        <Text style={styles.price}>{Number(product.price).toFixed(0)} ₽</Text>
      </View>

      <View style={styles.actionContainer}>
        {quantity === 0 ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>В корзину</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrease}
            >
              <Ionicons name="remove" size={20} color={Colors.light.cta} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrease}
            >
              <Ionicons name="add" size={20} color={Colors.light.cta} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.ml,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    ...Shadows.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addToCartButton: {
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingHorizontal: 36,
    paddingVertical: 18,
    ...Shadows.lg,
  },
  addToCartText: {
    color: Colors.light.card,
    fontSize: 17,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.light.primaryBorder,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.s,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginHorizontal: Spacing.m,
    minWidth: 16,
    textAlign: 'center',
  },
});

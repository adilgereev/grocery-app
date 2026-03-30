import { Colors, Radius, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
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
  return (
    <View style={styles.bottomBar}>
      <View>
        <Text style={styles.priceLabel}>Цена</Text>
        <Text style={styles.price}>{Number(product.price).toFixed(0)} ₽</Text>
      </View>

      <View style={styles.actionContainer}>
        {quantity === 0 ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart}>
            <Text style={styles.addToCartText}>В корзину</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={Colors.light.primary} />
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
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    elevation: 10,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
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
    fontWeight: '900',
    color: Colors.light.text,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addToCartButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: 36,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addToCartText: {
    color: Colors.light.card,
    fontSize: 17,
    fontWeight: '800',
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
    borderRadius: 19,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginHorizontal: Spacing.m,
    minWidth: 16,
    textAlign: 'center',
  },
});

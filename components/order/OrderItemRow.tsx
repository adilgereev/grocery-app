import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Product } from '@/types';

interface OrderItemRowProps {
  item: {
    id: string;
    quantity: number;
    price_at_time: number;
    product?: Product | { name: string; image_url?: string };
  };
  isLast: boolean;
}

/**
 * Строка товара в списке заказа.
 * Отображает фото, название, количество и итоговую стоимость позиции.
 */
const OrderItemRow = ({ item, isLast }: OrderItemRowProps) => {
  const productName = item.product?.name || 'Товар';
  const imageUrl = (item.product as Product)?.image_url || (item.product as any)?.image_url;
  const totalPrice = Number(item.quantity * item.price_at_time).toFixed(0);

  return (
    <View>
      <View style={styles.productRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
          <Text style={styles.productQty}>
            {item.quantity} шт × {item.price_at_time} ₽
          </Text>
        </View>
        <Text style={styles.productPrice}>{totalPrice} ₽</Text>
      </View>
      {!isLast && <View style={styles.itemDivider} />}
    </View>
  );
};

export default React.memo(OrderItemRow);

const styles = StyleSheet.create({
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.m,
    marginRight: Spacing.m,
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: Radius.m,
    marginRight: Spacing.m,
    backgroundColor: Colors.light.borderLight,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  productQty: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginLeft: Spacing.s,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 72,
  },
});

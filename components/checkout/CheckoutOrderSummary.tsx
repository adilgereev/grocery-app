import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import { getOptimizedImage } from '@/lib/utils/imageKit';

interface CheckoutItem {
  product: Product;
  quantity: number;
}

interface CheckoutOrderSummaryProps {
  items: CheckoutItem[];
}

/**
 * Список товаров на экране оформления заказа.
 * Всегда развёрнут — даёт пользователю уверенность в составе заказа.
 */
export default function CheckoutOrderSummary({ items }: CheckoutOrderSummaryProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>ВАШ ЗАКАЗ</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <React.Fragment key={item.product.id}>
            <View style={styles.row}>
              <Image
                source={{ uri: item.product.image_url ? getOptimizedImage(item.product.image_url, { width: 56, height: 56 }) : undefined }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.unit}>{item.product.unit}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.qty}>×{item.quantity}</Text>
                <Text style={styles.price}>{(Number(item.product.price) * item.quantity).toFixed(0)} ₽</Text>
              </View>
            </View>
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.m,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.s,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.sm,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: Radius.m,
    backgroundColor: Colors.light.borderLight,
    marginRight: Spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: Spacing.s,
  },
  name: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  unit: {
    fontSize: FontSize.s,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  qty: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  price: {
    fontSize: FontSize.m,
    fontWeight: '700',
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: Spacing.m,
  },
});

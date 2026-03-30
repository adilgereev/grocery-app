import { Colors, Radius, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProductInfoProps {
  product: Product;
}

/**
 * Основная информация о товаре (название, единица измерения, описание)
 */
export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.categoryBadge}>{product.unit}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О товаре</Text>
        <Text style={styles.description}>
          {product.description || 'Вкусный и свежий продукт, который отлично подойдет для вашего стола. Тщательно отобран фермерами и готов к употреблению.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  categoryBadge: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '700',
    marginBottom: 28,
    backgroundColor: Colors.light.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.s,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
  },
});

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProductNutritionProps {
  product: Product;
}

/**
 * Секция с пищевой ценностью товара (КБЖУ)
 */
export const ProductNutrition: React.FC<ProductNutritionProps> = ({ product }) => {
  // Используем реальные данные из БД, падая на 0 если они не заданы
  const calories = product.calories ?? 0;
  const proteins = product.proteins ?? 0;
  const fats = product.fats ?? 0;
  const carbohydrates = product.carbohydrates ?? 0;

  // Если все показатели по нулям, возможно это не пищевой продукт, но для единообразия покажем
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Пищевая ценность (на 100г)</Text>
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionBox}>
          <Text style={styles.nutritionValue}>{calories}</Text>
          <Text style={styles.nutritionLabel}>ккал</Text>
        </View>
        <View style={styles.nutritionBox}>
          <Text style={styles.nutritionValue}>{proteins} г</Text>
          <Text style={styles.nutritionLabel}>Белки</Text>
        </View>
        <View style={styles.nutritionBox}>
          <Text style={styles.nutritionValue}>{fats} г</Text>
          <Text style={styles.nutritionLabel}>Жиры</Text>
        </View>
        <View style={styles.nutritionBox}>
          <Text style={styles.nutritionValue}>{carbohydrates} г</Text>
          <Text style={styles.nutritionLabel}>Углеводы</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  nutritionBox: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  nutritionLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/product/ProductCard';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { Product } from '@/types';

type Props = {
  recommended: Product[];
  onGoShopping: () => void;
  onProductPress: (id: string, name: string) => void;
};

export default function FavoritesEmptyState({ recommended, onGoShopping, onProductPress }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart-outline" size={48} color={Colors.light.primary} />
        </View>
        <Text style={styles.title}>Тут пока пусто</Text>
        <Text style={styles.subText}>Сохраняйте товары в Избранное, чтобы покупать их быстрее</Text>
        <TouchableOpacity style={styles.goShoppingBtn} onPress={onGoShopping}>
          <Text style={styles.goShoppingBtnText}>Перейти к покупкам</Text>
        </TouchableOpacity>
      </View>

      {recommended.length > 0 && (
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Часто добавляют</Text>
          <View style={styles.gridContainer}>
            {recommended.map((item, index) => (
              <View key={`rec-${item.id}`} style={styles.gridItem}>
                <ProductCard item={item} index={index} onPress={() => onProductPress(item.id, item.name)} />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.ml,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  subText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.l,
    lineHeight: 22,
  },
  goShoppingBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    ...Shadows.md,
  },
  goShoppingBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700',
  },
  recommendedSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.m,
  },
});

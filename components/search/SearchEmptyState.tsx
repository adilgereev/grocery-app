import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProductCard from '@/components/product/ProductCard';
import { Colors, Spacing } from '@/constants/theme';
import { Product } from '@/types';

const POPULAR_SEARCHES = ['Молоко', 'Хлеб', 'Яйца', 'Сыр', 'Вода', 'Курица', 'Масло'];

interface SearchEmptyStateProps {
  recommended: Product[];
  onTagPress: (tag: string) => void;
  onProductPress: (id: string, name: string) => void;
}

export default function SearchEmptyState({
  recommended,
  onTagPress,
  onProductPress,
}: SearchEmptyStateProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Часто ищут</Text>
        <View style={styles.tagsContainer}>
          {POPULAR_SEARCHES.map((tag, index) => (
            <TouchableOpacity
              key={`tag-${index}`}
              style={styles.tagBadge}
              onPress={() => onTagPress(tag)}
              testID={`search-tag-${index}`}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {recommended.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Популярные товары</Text>
          <View style={styles.gridContainer}>
            {recommended.map((item, index) => (
              <View key={`rec-${item.id}`} style={styles.gridItem}>
                <ProductCard
                  item={item}
                  index={index}
                  onPress={() => onProductPress(item.id, item.name)}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.ml,
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tagText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.m,
  },
});

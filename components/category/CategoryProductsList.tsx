import React, { useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import ProductCard from '@/components/product/ProductCard';
import TagFilter from './TagFilter';
import { Colors, Spacing } from '@/constants/theme';
import { Product } from '@/types';

interface CategoryProductsListProps {
  products: Product[];
  tags: string[];
  activeTag: string | null;
  onTagPress: (tag: string | null) => void;
  onProductPress: (id: string, name: string) => void;
}

export default function CategoryProductsList({
  products,
  tags,
  activeTag,
  onTagPress,
  onProductPress,
}: CategoryProductsListProps) {
  const { width: windowWidth } = useWindowDimensions();

  const filteredProducts = useMemo(() => {
    if (!activeTag) return products;
    return products.filter((p) => p.tags?.includes(activeTag));
  }, [products, activeTag]);

  const cardRowHeight = useMemo(() => {
    const cardWidth = Math.round((windowWidth - Spacing.m * 2 - 16) / 2);
    return cardWidth + 132;
  }, [windowWidth]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: cardRowHeight,
      offset: Spacing.m + Math.floor(index / 2) * cardRowHeight,
      index,
    }),
    [cardRowHeight]
  );

  const handleProductPress = useCallback((id: string, name: string) => {
    onProductPress(id, name);
  }, [onProductPress]);

  const handleTagPress = useCallback((tag: string | null) => {
    onTagPress(tag);
  }, [onTagPress]);

  return (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={
        <TagFilter tags={tags} activeTag={activeTag} onTagPress={handleTagPress} />
      }
      getItemLayout={getItemLayout}
      renderItem={({ item, index }) => (
        <ProductCard
          item={item}
          index={index}
          onPress={() => handleProductPress(item.id, item.name)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyText}>
          <Text style={styles.emptyTextContent}>Ничего не найдено по этому фильтру.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: { justifyContent: 'space-between' },
  emptyText: {
    width: '100%',
  },
  emptyTextContent: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.ml,
  },
});

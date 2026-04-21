import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePopularProductsStore } from '@/store/popularProductsStore';
import { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface Props {
  excludeIds?: string[];
}

export default function CartRecommendations({ excludeIds }: Props) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const products = usePopularProductsStore(state => state.products);
  const isLoading = usePopularProductsStore(state => state.isLoading);
  const fetchProducts = usePopularProductsStore(state => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = useCallback(
    (item: Product) => {
      router.push(`/product/${item.id}?name=${encodeURIComponent(item.name)}`);
    },
    [router],
  );

  const recommended = useMemo(() => {
    const filtered = excludeIds?.length
      ? products.filter((p) => !excludeIds.includes(p.id))
      : products;
    return filtered.slice(0, 6);
  }, [products, excludeIds]);

  // Spacing.ml * 2 — отступы родителя, Spacing.s — зазор между колонками
  const cardWidth = useMemo(
    () => (screenWidth - Spacing.ml * 2 - Spacing.s) / 2,
    [screenWidth],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <View style={{ width: cardWidth }}>
        <ProductCard item={item} index={index} onPress={() => handleProductPress(item)} />
      </View>
    ),
    [cardWidth, handleProductPress],
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.light.primary} />
      </View>
    );
  }

  if (recommended.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Может быть интересно?</Text>
        <Text style={styles.empty}>Скоро здесь появятся рекомендации</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Может быть интересно?</Text>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  loaderContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  empty: {
    color: Colors.light.textSecondary,
    fontSize: FontSize.m,
  },
});

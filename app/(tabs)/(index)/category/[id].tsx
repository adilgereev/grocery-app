import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCategoryData } from '@/hooks/useCategoryData';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import { useProductTags } from '@/hooks/useProductTags';
import CategoryHeader from '@/components/category/CategoryHeader';
import SubcategoriesSection from '@/components/category/SubcategoriesSection';
import CategoryLoadingState from '@/components/category/CategoryLoadingState';
import CategoryErrorState from '@/components/category/CategoryErrorState';
import CategoryEmptyState from '@/components/category/CategoryEmptyState';
import CategoryProductsList from '@/components/category/CategoryProductsList';
import { Colors } from '@/constants/theme';

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();

  const { category, subcategories, fetchAllCategories } = useCategoryData(id);
  const { products, loading, error, fetchProducts } = useCategoryProducts(id);
  const { uniqueTags, activeTag, setActiveTag } = useProductTags(products);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleProductPress = useCallback((productId: string, productName: string) => {
    router.push(`/product/${productId}?name=${encodeURIComponent(productName)}`);
  }, [router]);

  const handleSubcategoryPress = useCallback((subcatId: string, subcatName: string) => {
    router.push(`/category/${subcatId}?name=${encodeURIComponent(subcatName)}`);
  }, [router]);

  const categoryTitle = category?.name || name || 'Продукты';

  return (
    <View style={styles.container}>
      <CategoryHeader title={String(categoryTitle)} onBackPress={handleBack} />

      <SubcategoriesSection
        subcategories={subcategories}
        onSubcategoryPress={handleSubcategoryPress}
      />

      {loading ? (
        <CategoryLoadingState />
      ) : error ? (
        <CategoryErrorState
          error={error}
          isRetrying={loading}
          onRetry={() => id && fetchProducts(id as string)}
        />
      ) : products.length === 0 ? (
        <CategoryEmptyState />
      ) : (
        <CategoryProductsList
          products={products}
          tags={uniqueTags}
          activeTag={activeTag}
          onTagPress={setActiveTag}
          onProductPress={handleProductPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});

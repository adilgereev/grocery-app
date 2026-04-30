import React, { useCallback } from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ErrorState from '@/components/ui/ErrorState';
import ProductCard from '@/components/product/ProductCard';
import FavoritesLoadingSkeleton from '@/components/profile/FavoritesLoadingSkeleton';
import FavoritesEmptyState from '@/components/profile/FavoritesEmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import { Colors, Spacing } from '@/constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { products, loading, refreshing, error, recommended, onRefresh, refetch, getItemLayout } = useFavorites();

  const handleProductPress = useCallback(
    (id: string, name: string) => {
      router.push(`/product/${id}?name=${encodeURIComponent(name)}`);
    },
    [router]
  );

  const handleGoShopping = useCallback(() => {
    router.push('/(tabs)/(index)' as any);
  }, [router]);

  if (loading && products.length === 0) {
    return <FavoritesLoadingSkeleton />;
  }

  if (error && products.length === 0) {
    return <ErrorState error={error} isRetrying={loading} onRetry={refetch} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Избранное" />

      {products.length === 0 ? (
        <FavoritesEmptyState
          recommended={recommended}
          onGoShopping={handleGoShopping}
          onProductPress={handleProductPress}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />
          }
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          getItemLayout={getItemLayout}
          renderItem={({ item, index }) => (
            <ProductCard item={item} index={index} onPress={() => handleProductPress(item.id, item.name)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: { justifyContent: 'space-between' },
});

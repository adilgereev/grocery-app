import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { fetchFavoriteProducts as fetchFavoriteProductsByIds } from '@/lib/favoriteApi';
import { fetchRecommendedProducts } from '@/lib/productsApi';
import { useAuth } from '@/providers/AuthProvider';
import { useFavoriteStore } from '@/store/favoriteStore';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import Skeleton from '@/components/Skeleton';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { Product } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';

export default function FavoritesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommended, setRecommended] = useState<Product[]>([]);
  
  const { favoriteIds } = useFavoriteStore();

  const fetchRecommended = useCallback(async () => {
    if (recommended.length > 0) return;
    const data = await fetchRecommendedProducts(6);
    setRecommended(data);
  }, [recommended.length]);

  const fetchFavoriteProducts = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      fetchRecommended();
      return;
    }

    const data = await fetchFavoriteProductsByIds(favoriteIds);
    setProducts(data);
    setLoading(false);
    setRefreshing(false);
  }, [favoriteIds, fetchRecommended]);

  useEffect(() => {
    if (session?.user) {
      fetchFavoriteProducts();
    }
  }, [session, favoriteIds, fetchFavoriteProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavoriteProducts();
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ScreenHeader title="Избранное" />
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <Skeleton key={i} width="47%" height={230} borderRadius={Radius.l} style={styles.skeletonItem} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Избранное" />

      {products.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyHeader}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={48} color={Colors.light.error} />
            </View>
            <Text style={styles.emptyTitle}>Тут пока пусто</Text>
            <Text style={styles.emptySubText}>Сохраняйте товары в Избранное, чтобы покупать их быстрее</Text>
            
            <TouchableOpacity style={styles.goShoppingBtn} onPress={() => router.push('/(tabs)/(index)' as any)}>
              <Text style={styles.goShoppingBtnText}>Перейти к покупкам</Text>
            </TouchableOpacity>
          </View>

          {recommended.length > 0 && (
            <View style={styles.recommendedSection}>
              <Text style={styles.sectionTitle}>Часто добавляют</Text>
              <View style={styles.gridContainer}>
                {recommended.map((item, index) => (
                  <View key={`rec-${item.id}`} style={styles.gridItem}>
                    <ProductCard item={item} index={index} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
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
          renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  emptyScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  emptyHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  emptySubText: {
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
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
  },
  skeletonItem: { marginBottom: Spacing.m },
  columnWrapper: { justifyContent: 'space-between' },
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

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useFavoriteStore } from '@/store/favoriteStore';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'expo-router';
import Skeleton from '@/components/Skeleton';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Product } from '@/types';

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
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(6);
    if (data) setRecommended(data);
  }, [recommended.length]);

  const fetchFavoriteProducts = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      fetchRecommended();
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', favoriteIds)
      .eq('is_active', true);

    if (!error) {
      setProducts(data || []);
    }
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
      <View style={styles.loadingContainer}>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <Skeleton key={i} width="47%" height={230} borderRadius={Radius.l} style={styles.skeletonItem} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Избранное</Text>
        <View style={styles.headerRightSpacer} />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    paddingTop: 60,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    elevation: 4,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: Spacing.s,
    zIndex: 10,
  },
  headerRightSpacer: { width: 24 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 100,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
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
    fontWeight: '800',
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
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
  },
  skeletonItem: { marginBottom: Spacing.m },
  columnWrapper: { justifyContent: 'space-between' },
  recommendedSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
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

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryStore } from '@/store/categoryStore';
import ProductCard from '@/components/ProductCard';
import SubcategoryCard from '@/components/SubcategoryCard';
import Skeleton from '@/components/Skeleton';
import { ErrorToast } from '@/components/ErrorToast';
import { logger } from '@/lib/logger';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Product } from '@/types';
import { getMosaicCardWidth } from '@/utils/mosaicLayout';

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Подключаем хранилище категорий для получения подкатегорий
  const { getCategoryById, getSubcategories, fetchAllCategories } = useCategoryStore();
  const category = getCategoryById(id as string);
  const subcategories = getSubcategories(id as string);
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - Spacing.m * 2;
  const GAP = 8;

  const fetchProducts = useCallback(async (categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setProducts(data || []);
      setActiveTag(null); // Reset tag when category changes
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить товары';
      logger.error('Ошибка загрузки товаров:', err);
      setError(errorMessage);
      ErrorToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Загружаем категории для заполнения store
    fetchAllCategories();

    if (id) {
      fetchProducts(id as string);
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [id, fetchAllCategories, fetchProducts]);

  const uniqueTags = useMemo(() => {
    const allTags = products.flatMap((p) => p.tags || []);
    return Array.from(new Set(allTags));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeTag) return products;
    return products.filter((p) => p.tags?.includes(activeTag));
  }, [products, activeTag]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{category?.name || name || 'Продукты'}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Секция подкатегорий (если есть) */}
      {subcategories.length > 0 && (
        <View style={styles.subcategoriesSection}>
          <Text style={styles.subcategoriesTitle}>Подкатегории</Text>
          <View style={styles.subcategoriesRow}>
            {subcategories.map((item, index) => {
              const cardWidth = getMosaicCardWidth(
                index,
                subcategories.length,
                containerWidth,
                GAP
              );
              return (
                <SubcategoryCard 
                  key={item.id} 
                  subcategory={item} 
                  cardWidth={cardWidth}
                  index={index} 
                />
              );
            })}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width="47%" height={230} borderRadius={Radius.l} style={styles.skeletonItem} />
          ))}
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => id && fetchProducts(id as string)}>
            {loading ? (
              <ActivityIndicator color={Colors.light.card} />
            ) : (
              <Text style={styles.retryButtonText}>Повторить</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>В этой категории пока нет товаров.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            uniqueTags.length > 0 ? (
              <View style={styles.tagsWrapper}>
                <View style={styles.tagsContainer}>
                  <TouchableOpacity
                    style={[styles.tagBadge, activeTag === null && styles.tagBadgeActive]}
                    onPress={() => setActiveTag(null)}
                  >
                    <Text style={[styles.tagText, activeTag === null && styles.tagTextActive]}>Все</Text>
                  </TouchableOpacity>
                  {uniqueTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagBadge, activeTag === tag && styles.tagBadgeActive]}
                      onPress={() => setActiveTag(tag)}
                    >
                      <Text style={[styles.tagText, activeTag === tag && styles.tagTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Ничего не найдено по этому фильтру.</Text>
          }
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: Colors.light.card,
    elevation: 4,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    marginBottom: Spacing.s,
    zIndex: 10,
  },
  headerRightSpacer: { width: 24 },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    color: Colors.light.textSecondary,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Spacing.l,
  },
  retryButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Spacing.m,
  },
  skeletonItem: { marginBottom: Spacing.m },
  columnWrapper: { justifyContent: 'space-between' },
  subcategoriesSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.m,
  },
  subcategoriesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  subcategoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 8,
    rowGap: 8,
  },
  tagsWrapper: {
    paddingBottom: Spacing.m,
    marginBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    height: 38,
    justifyContent: 'center',
  },
  tagBadgeActive: {
    backgroundColor: Colors.light.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tagTextActive: {
    color: Colors.light.card,
  }
});

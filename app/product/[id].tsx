import Skeleton from '@/components/ui/Skeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { logger } from '@/lib/utils/logger';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fetchProductById, fetchRelatedProducts } from '@/lib/api/productsApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductNutrition } from '@/components/product/ProductNutrition';
import { ProductRelated } from '@/components/product/ProductRelated';
import { ProductBottomBar } from '@/components/product/ProductBottomBar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Product } from '@/types';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { session } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { items, addItem, updateQuantity } = useCartStore();
  const { favoriteIds, toggleFavorite } = useFavoriteStore();

  const cartItem = items.find((i) => i.product.id === id);
  const isFavorite = typeof id === 'string' ? favoriteIds.includes(id) : false;

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(id as string);
      if (!data) {
        setError('Товар не найден');
        return;
      }
      setProduct(data);

      if (data.category_id) {
        const related = await fetchRelatedProducts(data.category_id, data.id, 6);
        setRelatedProducts(related);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось загрузить товар';
      logger.error('Ошибка загрузки продукта:', e);
      setError(errorMessage);
      ErrorToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [id, fetchProductDetails]);

  const handleFavoritePress = () => {
    if (session?.user && product) {
      toggleFavorite(product, session.user.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerAbsolute}>
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <Skeleton width="100%" height={350} borderRadius={0} />
        <View style={styles.skeletonContent}>
          <Skeleton width="60%" height={32} borderRadius={8} style={styles.skeletonTitle} />
          <Skeleton width={100} height={20} borderRadius={8} style={styles.skeletonSubtitle} />
          <Skeleton width="100%" height={16} borderRadius={4} style={styles.skeletonText} />
          <Skeleton width="100%" height={16} borderRadius={4} style={styles.skeletonText} />
          <Skeleton width="80%" height={16} borderRadius={4} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
        <Text style={styles.errorText}>{error || 'Товар не найден'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProductDetails()}>
          {loading ? (
            <ActivityIndicator color={Colors.light.card} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={Colors.light.card} style={styles.retryIcon} />
              <Text style={styles.retryText}>Повторить</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} style={styles.flex1} showsVerticalScrollIndicator={false}>
        <ProductHeader
          product={product}
          isFavorite={isFavorite}
          onFavoritePress={handleFavoritePress}
        />

        <View style={styles.contentContainer}>
          <ProductInfo product={product} />
          
          <ProductNutrition product={product} />

          <ProductRelated 
            products={relatedProducts} 
            isLoading={loading} 
          />

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <ProductBottomBar
        product={product}
        quantity={cartItem?.quantity || 0}
        onAddToCart={() => addItem(product)}
        onUpdateQuantity={(newQty) => updateQuantity(product.id, newQty)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.card },
  flex1: { flex: 1 },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.card
  },
  errorText: {
    fontSize: 18, color: Colors.light.textSecondary, marginBottom: 20, textAlign: 'center'
  },
  retryButton: {
    backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.xl,
  },
  retryIcon: { marginRight: 8 },
  retryText: { color: Colors.light.card, fontWeight: '700' },
  backButton: { marginTop: 16 },
  backButtonText: { color: Colors.light.textSecondary, fontSize: 16 },
  headerAbsolute: {
    position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'space-between', paddingHorizontal: Spacing.m,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
  },
  contentContainer: {
    flex: 1, backgroundColor: Colors.light.card, borderTopLeftRadius: 36,
    borderTopRightRadius: 36, marginTop: -40, padding: Spacing.l,
  },
  bottomSpacer: { height: 120 },
  skeletonContent: { padding: Spacing.l },
  skeletonTitle: { marginBottom: 12 },
  skeletonSubtitle: { marginBottom: Spacing.l },
  skeletonText: { marginBottom: Spacing.s },
});


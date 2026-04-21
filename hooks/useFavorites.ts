import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { fetchFavoriteProducts as fetchFavoriteProductsByIds } from '@/lib/api/favoriteApi';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/providers/AuthProvider';
import { useFavoriteStore } from '@/store/favoriteStore';
import { usePopularProductsStore } from '@/store/popularProductsStore';
import { Spacing } from '@/constants/theme';
import { Product } from '@/types';

export function useFavorites() {
  const { session } = useAuth();
  const { width } = useWindowDimensions();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const favoriteIds = useFavoriteStore(state => state.favoriteIds);
  const favoriteIdsRef = useRef(favoriteIds);
  favoriteIdsRef.current = favoriteIds;

  const popularProducts = usePopularProductsStore(state => state.products);
  const fetchPopularProducts = usePopularProductsStore(state => state.fetchProducts);
  const recommended = useMemo(() => popularProducts.slice(0, 6), [popularProducts]);

  const cardRowHeight = useMemo(() => {
    const cardWidth = Math.round((width - Spacing.m * 2 - 16) / 2);
    return cardWidth + 132;
  }, [width]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: cardRowHeight,
      offset: Spacing.m + Math.floor(index / 2) * cardRowHeight,
      index,
    }),
    [cardRowHeight]
  );

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  const fetchFavoriteProducts = useCallback(async () => {
    const ids = favoriteIdsRef.current;
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await fetchFavoriteProductsByIds(ids);
      setProducts(data);
    } catch (error) {
      logger.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchFavoriteProducts();
    }
  }, [session, favoriteIds, fetchFavoriteProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavoriteProducts();
  }, [fetchFavoriteProducts]);

  return { products, loading, refreshing, recommended, onRefresh, cardRowHeight, getItemLayout };
}

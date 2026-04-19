import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { searchProducts, fetchPopularProducts } from '@/lib/api/productsApi';
import { logger } from '@/lib/utils/logger';
import { useToastStore } from '@/store/toastStore';
import { Spacing } from '@/constants/theme';
import { Product } from '@/types';

export function useSearch() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleProductPress = useCallback((id: string, name: string) => {
    router.push(`/product/${id}?name=${encodeURIComponent(name)}`);
  }, [router]);

  const fetchRecommended = useCallback(async () => {
    try {
      const data = await fetchPopularProducts(6);
      setRecommended(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось загрузить рекомендации';
      logger.error('Ошибка загрузки рекомендаций:', e);
      setError(errorMessage);
    }
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchProducts(searchQuery, 30);
      setResults(data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось выполнить поиск';
      logger.error('Ошибка поиска:', e);
      setError(errorMessage);
      useToastStore.getState().showToast('error', errorMessage);
      setResults([]);
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, performSearch]);

  const handleSearchSubmit = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed) performSearch(trimmed);
  }, [performSearch]);

  const handleTagPress = useCallback((text: string) => {
    setQuery(text);
    performSearch(text.trim());
  }, [performSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    recommended,
    loading,
    error,
    hasSearched,
    cardRowHeight,
    getItemLayout,
    handleProductPress,
    handleSearchSubmit,
    handleTagPress,
    handleClear,
    performSearch,
  };
}

import ProductCard from '@/components/product/ProductCard';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { logger } from '@/lib/utils/logger';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { searchProducts, fetchRecommendedProducts } from '@/lib/api/productsApi';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Product } from '@/types';

const POPULAR_SEARCHES = ['Молоко', 'Хлеб', 'Яйца', 'Сыр', 'Вода', 'Курица', 'Масло'];

export default function SearchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Фиксированная высота строки для оптимизации FlatList
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
      const data = await fetchRecommendedProducts(6);
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
      ErrorToast({ type: 'error', message: errorMessage });
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

  const handleSearchSubmit = (text: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      performSearch(trimmed);
    }
  };

  const handleTagPress = (text: string) => {
    setQuery(text);
    handleSearchSubmit(text);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.light.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Что вы ищете?"
              placeholderTextColor={Colors.light.textLight}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={(e) => handleSearchSubmit(e.nativeEvent.text)}
              returnKeyType="search"
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
                <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(query.trim().length === 0 || (!loading && !hasSearched)) ? (
          // Умный интерфейс "до ввода текста" (показываем пока поиск не завершился)
          <ScrollView 
            contentContainerStyle={styles.emptyStateContainer} 
            keyboardShouldPersistTaps="handled" 
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Часто ищут</Text>
              <View style={styles.tagsContainer}>
                {POPULAR_SEARCHES.map((tag, index) => (
                  <TouchableOpacity
                    key={`tag-${index}`}
                    style={styles.tagBadge}
                    onPress={() => handleTagPress(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {recommended.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Популярные товары</Text>
                <View style={styles.gridContainer}>
                  {recommended.map((item, index) => (
                    <View key={`rec-${item.id}`} style={styles.gridItem}>
                      <ProductCard item={item} index={index} onPress={() => handleProductPress(item.id, item.name)} />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        ) : (hasSearched && results.length === 0) ? (
          // Пустой результат поиска
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={Colors.light.icon} />
            <Text style={styles.emptyText}>{error || 'Ничего не найдено'}</Text>
            <Text style={styles.emptySubText}>{error ? 'Нажмите "Повторить" для повторной попытки' : 'Попробуйте изменить запрос'}</Text>
            {error && (
              <TouchableOpacity style={styles.retryButton} onPress={() => query && performSearch(query)}>
                {loading ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={20} color={Colors.light.white} style={styles.retryIcon} />
                    <Text style={styles.retryButtonText}>Повторить</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Результаты поиска
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            getItemLayout={getItemLayout}
            renderItem={({ item, index }) => <ProductCard item={item} index={index} onPress={() => handleProductPress(item.id, item.name)} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.s,
    marginRight: Spacing.s,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    marginTop: Spacing.m,
  },
  emptySubText: {
    fontSize: 15,
    color: Colors.light.textLight,
    marginTop: Spacing.s,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Radius.pill,
    marginTop: Spacing.m,
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  retryIcon: { marginRight: 8 },
  columnWrapper: { justifyContent: 'space-between' },
  // Стили для умного поиска
  emptyStateContainer: {
    padding: 20,
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: Colors.light.card,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.m,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tagText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.m,
  }
});

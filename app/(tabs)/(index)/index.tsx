import CategoryHierarchySection from '@/components/home/CategoryHierarchySection';
import StoriesSection from '@/components/home/StoriesSection';
import HomeHeader from '@/components/home/HomeHeader';
import PopularSection from '@/components/home/PopularSection';
import SubcategoriesSkeleton from '@/components/category/SubcategoriesSkeleton';
import { logger } from '@/lib/utils/logger';
import { fetchPopularProducts } from '@/lib/api/productsApi';
import { useAuth } from '@/providers/AuthProvider';
import { useAddressStore } from '@/store/addressStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useStoriesStore } from '@/store/storiesStore';
import { Category, Product } from '@/types';
import { formatShortAddress } from '@/lib/utils/addressFormatter';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { homeStyles as s } from '@/components/home/index.styles';

// Высота блока приветствия (greeting + адрес)
const GREETING_HEIGHT = 52;

export default function HomeScreen() {
  const { session, profile } = useAuth();
  const router = useRouter();

  const categoriesWithSubs = useCategoryStore(state => state.categoriesWithSubs);
  const fetchFullHierarchy = useCategoryStore(state => state.fetchFullHierarchy);
  const categoriesLoading = useCategoryStore(state => state.isLoading);
  const fetchStories = useStoriesStore(state => state.fetchStories);

  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Имя из контекста (сбрасывается при выходе)
  const firstName = profile?.first_name || '';

  const addresses = useAddressStore(state => state.addresses);
  const selectedAddressId = useAddressStore(state => state.selectedAddressId);
  const loadAddresses = useAddressStore(state => state.loadAddresses);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const displayAddress = formatShortAddress(selectedAddress);

  // Анимация привязана к позиции скролла
  const scrollY = useRef(new Animated.Value(0)).current;
  const greetingHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [GREETING_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const loadPopularProducts = useCallback(async () => {
    setPopularLoading(true);
    try {
      const data = await fetchPopularProducts(10);
      setPopularProducts(data || []);
    } catch (error: unknown) {
      logger.error('Ошибка загрузки популярных:', error instanceof Error ? error.message : error);
    } finally {
      setPopularLoading(false);
    }
  }, []);

  // Обновление всех секций одновременно, спиннер ждёт завершения всех запросов
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchFullHierarchy(true),
        loadPopularProducts(),
        fetchStories(true),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchFullHierarchy, loadPopularProducts, fetchStories]);

  // Загружаем данные при каждом фокусе на страницу
  useFocusEffect(
    useCallback(() => {
      fetchFullHierarchy();
      loadPopularProducts();
      fetchStories();

      if (session?.user) {
        loadAddresses();
      }
    }, [session, loadAddresses, fetchFullHierarchy, loadPopularProducts, fetchStories])
  );

  // Определяем приветствие по времени суток
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Доброе утро', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Добрый день', emoji: '🌤' };
    if (hour >= 18 && hour < 24) return { text: 'Добрый вечер', emoji: '🌙' };
    return { text: 'Доброй ночи', emoji: '✨' };
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Секция категорий (мемоизирована)
  const categoriesSection = useMemo(() => (
    <>
      {categoriesLoading && categoriesWithSubs.length === 0 ? (
        <SubcategoriesSkeleton count={6} />
      ) : categoriesWithSubs.length > 0 ? (
        <View style={s.hierarchyContainer}>
          {categoriesWithSubs.map((category) => (
            <CategoryHierarchySection key={category.id} category={category} />
          ))}
        </View>
      ) : (
        <Text style={s.categoryFallbackTitle}>Категории</Text>
      )}
    </>
  ), [categoriesLoading, categoriesWithSubs]);

  // Стабильный заголовок списка
  const listHeader = useMemo(() => (
    <>
      <StoriesSection />
      <PopularSection
        products={popularProducts}
        loading={popularLoading}
        onProductPress={(id) => router.push(`/product/${id}`)}
      />
      {categoriesSection}
    </>
  ), [popularProducts, popularLoading, router, categoriesSection]);

  return (
    <View style={s.container}>
      <SafeAreaView style={s.safeAreaTop} edges={['top']} />
      <HomeHeader
        firstName={firstName}
        greeting={greeting}
        displayAddress={displayAddress}
        greetingHeight={greetingHeight}
        greetingOpacity={greetingOpacity}
        onSearchPress={() => router.push('/search')}
        onAddressPress={() => {
          if (!session?.user) {
            router.push('/(auth)/login');
          } else {
            router.push('/addresses');
          }
        }}
      />

      <FlatList
        data={[] as Category[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={listHeader}
        renderItem={() => null}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

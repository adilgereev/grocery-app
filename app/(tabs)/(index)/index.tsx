import CategoryHierarchySection from '@/components/CategoryHierarchySection';
import PopularProductsSkeleton from '@/components/PopularProductsSkeleton';
import SubcategoriesSkeleton from '@/components/SubcategoriesSkeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { mockBanners } from '@/data/mockBanners';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useAddressStore } from '@/store/addressStore';
import { useCartStore } from '@/store/cartStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';
import { formatShortAddress } from '@/utils/addressFormatter';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList, Image, ImageBackground,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Высота блока приветствия (greeting + margin)
// Высота блока приветствия (greeting + адрес) — теперь 2 строки. 
// Сделаем более компактно после уменьшения шрифтов.
const GREETING_HEIGHT = 52;

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();

  // Подключаем хранилище категорий для иерархии
  const { categoriesWithSubs, fetchFullHierarchy, isLoading: categoriesLoading } = useCategoryStore();
  const { addItem } = useCartStore();

  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>('');

  // Подключаем хранилище адресов
  const { addresses, selectedAddressId, loadAddresses } = useAddressStore();
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const displayAddress = formatShortAddress(selectedAddress);

  // Прямая привязка анимации к позиции скролла — нет конфликтов, нет дрожания
  const scrollY = useRef(new Animated.Value(0)).current;

  // Высота блока плавно сходит к 0 при скролле вниз
  const greetingHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [GREETING_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  // Прозрачность исчезает чуть раньше чем высота
  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const fetchPopularProducts = useCallback(async () => {
    try {
      if (popularProducts.length === 0) { // Silent refresh check
        setPopularLoading(true);
      }
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, unit')
        .order('price', { ascending: false })
        .limit(10);
      if (error) {
        logger.error('Ошибка загрузки популярных:', error.message);
      }
      setPopularProducts(data || []);
    } finally {
      setPopularLoading(false);
    }
  }, [popularProducts.length]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const userId = session!.user.id;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();
      if (profileData?.first_name) setFirstName(profileData.first_name);
    } catch (error) {
      logger.error('Ошибка в fetchUserInfo:', error);
    }
  }, [session]);

  useEffect(() => {
    // Начальная загрузка при монтировании (базовая)
  }, []);

  // Загружаем данные при каждом фокусе на страницу
  useFocusEffect(
    useCallback(() => {
      // fetchFullHierarchy проверит кеш: если он сброшен (invalidateCache), будет сетевой запрос
      // Позволяем стору использовать кеш (5 минут), если не было принудительного обновления (onRefresh)
      fetchFullHierarchy();
      fetchPopularProducts();

      if (session?.user) {
        fetchUserInfo();
        loadAddresses(); // Синхронизируем адреса из стора
      }
    }, [session, loadAddresses, fetchUserInfo, fetchFullHierarchy, fetchPopularProducts])
  );

  // Определяем приветствие по времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Доброе утро', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Добрый день', emoji: '🌤' };
    if (hour >= 18 && hour < 24) return { text: 'Добрый вечер', emoji: '🌙' };
    return { text: 'Доброй ночи', emoji: '✨' };
  };

  const greeting = getGreeting();

  // Обработчик скролла — просто пишем Animated.event
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Секция «Популярное» (Мемоизирована)
  const popularSection = useMemo(() => {
    if (popularLoading && popularProducts.length === 0) {
      return <PopularProductsSkeleton count={5} />;
    }
    if (popularProducts.length === 0 && !popularLoading) return null;

    return (
      <View style={styles.popularSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Популярное</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Все</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularScroll}
        >
          {popularProducts.map((product) => (
            <TouchableOpacity
              key={product.id} style={styles.popularCard} activeOpacity={0.8}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <View style={styles.imageWrapper}>
                {product.image_url
                  ? <Image source={{ uri: product.image_url }} style={styles.popularImage} />
                  : <View style={[styles.popularImage, styles.imagePlaceholder]} />
                }
                <TouchableOpacity
                  style={styles.addPopularButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    addItem(product);
                  }}
                  activeOpacity={0.9}
                >
                  <Ionicons name="add" size={20} color={Colors.light.card} />
                </TouchableOpacity>
              </View>
              <View style={styles.popularInfo}>
                <Text style={styles.popularName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.popularPrice}>
                  {product.price} ₽<Text style={styles.popularUnit}> / {product.unit}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [popularProducts, popularLoading, addItem, router]);

  // Секция баннеров (Мемоизирована)
  const bannersSection = useMemo(() => (
    <View style={styles.bannersSection}>
      <Text style={styles.bannersTitle}>Акции и новинки</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannersScroll}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH * 0.8 + 16}
      >
        {mockBanners.map((banner) => (
          <TouchableOpacity key={banner.id} style={styles.bannerCard} activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: banner.image_url }}
              style={styles.bannerImage}
              imageStyle={styles.bannerImageBorder}
            >
              <LinearGradient
                colors={[Colors.light.blackTransparent, 'transparent']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0.4 }}
                style={styles.gradientOverlay}
              />
              <Text style={styles.bannerTitle}>{banner.title}</Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), []);

  // Секция категорий (Мемоизирована)
  const categoriesSection = useMemo(() => (
    <>
      {categoriesLoading && categoriesWithSubs.length === 0 ? (
        <SubcategoriesSkeleton count={6} />
      ) : categoriesWithSubs.length > 0 ? (
        <View style={styles.hierarchyContainer}>
          {categoriesWithSubs.map((category) => (
            <CategoryHierarchySection key={category.id} category={category} />
          ))}
        </View>
      ) : (
        <Text style={styles.categoryFallbackTitle}>Категории</Text>
      )}
    </>
  ), [categoriesLoading, categoriesWithSubs]);

  // Стабильный заголовок списка
  const listHeader = useMemo(() => (
    <>
      {bannersSection}
      {popularSection}
      {categoriesSection}
    </>
  ), [bannersSection, popularSection, categoriesSection]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']} />
      {/* Умная шапка: приветствие скрывается при скролле */}
      <View style={styles.header}>
        {/* Анимированная строка приветствия + адрес */}
        <Animated.View style={[styles.greetingAnimationContainer, { height: greetingHeight, opacity: greetingOpacity }]}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              {firstName ? `${greeting.text}, ${firstName}! ${greeting.emoji}` : `${greeting.text}! ${greeting.emoji}`}
            </Text>
            {/* Клик по адресу → экран "Мои адреса" (или логин для гостя) */}
            <TouchableOpacity
              style={styles.addressRow}
              activeOpacity={0.7}
              onPress={() => {
                if (!session?.user) {
                  router.push('/(auth)/login');
                } else {
                  router.push('/addresses');
                }
              }}
            >
              <Ionicons name="location" size={14} color={Colors.light.primary} />
              <Text style={styles.addressText} numberOfLines={1}>
                {displayAddress}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.light.textLight} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Строка поиска — всегда видна */}
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={20} color={Colors.light.primary} style={styles.searchIcon} />
          <Text style={styles.searchInputText}>Поиск</Text>
        </TouchableOpacity>
      </View>

      {/* Список с шапкой */}
      <FlatList
        data={[] as Category[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={listHeader}
        renderItem={() => null} // Рендер происходит в ListHeader
        refreshing={categoriesLoading}
        onRefresh={() => {
          fetchFullHierarchy(true);
          fetchPopularProducts();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.light.card,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    elevation: 8,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    zIndex: 10,
  },
  safeAreaTop: { backgroundColor: Colors.light.card },
  greetingAnimationContainer: { overflow: 'hidden' },

  // Приветствие и адрес теперь в стек
  greetingContainer: {
    justifyContent: 'center',
    paddingBottom: Spacing.m,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  addressText: {
    fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500',
    maxWidth: SCREEN_WIDTH * 0.85,
  },

  // Поиск
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.l, paddingHorizontal: Spacing.m, height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInputText: { flex: 1, fontSize: 16, color: Colors.light.textSecondary },

  listContainer: { paddingTop: 0, paddingBottom: 80 },
  hierarchyContainer: {
    paddingTop: 0,
  },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.l },
  // Баннеры
  bannersSection: { marginBottom: Spacing.xl, marginTop: Spacing.m },
  bannersTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text, paddingHorizontal: Spacing.m, marginBottom: Spacing.s },
  bannersScroll: { paddingHorizontal: Spacing.m },
  bannerCard: {
    width: SCREEN_WIDTH * 0.8, height: 160, marginRight: Spacing.m, borderRadius: Radius.xl,
    elevation: 4, shadowColor: Colors.light.primary, shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 }, shadowRadius: 14,
  },
  bannerImage: { width: '100%', height: '100%', borderRadius: Radius.l },
  bannerImageBorder: { borderRadius: Radius.xl },
  bannerTitle: {
    color: Colors.light.card, fontSize: 20, fontWeight: '900',
    textShadowColor: Colors.light.blackTransparent, textShadowOffset: { width: 0, height: 2 },
    position: 'absolute', bottom: Spacing.m, left: Spacing.m, right: Spacing.m,
  },

  // Популярное
  popularSection: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.m, marginBottom: Spacing.s,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text },
  seeAllText: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  popularScroll: { paddingHorizontal: Spacing.m },
  popularCard: {
    width: 140, marginRight: Spacing.m, backgroundColor: Colors.light.card, borderRadius: Radius.l,
    overflow: 'hidden', elevation: 2, shadowColor: Colors.light.text, shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 14,
  },
  imageWrapper: { position: 'relative', width: '100%', height: 110 },
  imagePlaceholder: { backgroundColor: Colors.light.borderLight },
  popularImage: { width: '100%', height: '100%' },
  popularInfo: { padding: Spacing.s, flex: 1, justifyContent: 'center' },
  popularName: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: 2 },
  popularPrice: { fontSize: 14, fontWeight: '800', color: Colors.light.text },
  popularUnit: { fontSize: 11, color: Colors.light.textLight, fontWeight: '600' },
  addPopularButton: {
    position: 'absolute', bottom: 8, right: 8,
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.light.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
    shadowColor: Colors.light.text, shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  categoryFallbackTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text, paddingHorizontal: Spacing.m }
});

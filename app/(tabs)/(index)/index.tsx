import Skeleton from '@/components/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { mockBanners } from '@/data/mockBanners';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useCategoryStore } from '@/store/categoryStore';
import CategoryHierarchySection from '@/components/CategoryHierarchySection';
import SubcategoriesSkeleton from '@/components/SubcategoriesSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAddressStore } from '@/store/addressStore';
import {
  Animated,
  Dimensions,
  FlatList, Image, ImageBackground,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '@/types';

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

  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string>('');

  // Подключаем хранилище адресов
  const { addresses, selectedAddressId, loadAddresses } = useAddressStore();
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const displayAddress = selectedAddress 
    ? selectedAddress.text.replace(/^г\. Буйнакск, /, '') 
    : 'Выберите адрес';

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

  useEffect(() => {
    fetchFullHierarchy();
    fetchPopularProducts();
  }, [fetchFullHierarchy]);

  // Загружаем имя и адрес при каждом фокусе на страницу
  useFocusEffect(
    useCallback(() => {
      if (session?.user) {
        fetchUserInfo();
        loadAddresses(); // Синхронизируем адреса из стора
      }
    }, [session, loadAddresses])
  );

  async function fetchPopularProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, image_url, unit')
      .order('price', { ascending: false })
      .limit(10);
    if (error) console.error('Ошибка загрузки популярных:', error.message);
    setPopularProducts(data || []);
  }

  async function fetchUserInfo() {
    try {
      const userId = session!.user.id;
      
      // Загружаем только имя профиля, так как адрес теперь в сторе
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();

      if (profileData?.first_name) setFirstName(profileData.first_name);
    } catch (error) {
      console.error('Ошибка в fetchUserInfo:', error);
    }
  }

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

  // Секция «Популярное»
  const renderPopularProducts = () => {
    if (!popularProducts.length) return null;
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
              {product.image_url
                ? <Image source={{ uri: product.image_url }} style={styles.popularImage} />
                : <View style={[styles.popularImage, { backgroundColor: Colors.light.borderLight }]} />
              }
              <View style={styles.popularInfo}>
                <Text style={styles.popularName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.popularPrice}>{product.price} ₽</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Секция баннеров
  const renderBanners = () => (
    <View style={styles.bannersSection}>
      <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.m, marginBottom: Spacing.s }]}>Акции и новинки</Text>
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
              imageStyle={{ borderRadius: Radius.xl }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
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
  );

  const ListHeader = () => {
    return (
      <>
        {renderBanners()}
        {renderPopularProducts()}

        {/* Секция иерархических категорий */}
        {categoriesLoading ? (
          <>
            <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.m, marginBottom: Spacing.s }]}>Категории</Text>
            <SubcategoriesSkeleton count={6} />
          </>
        ) : categoriesWithSubs.length > 0 ? (
          <View style={styles.hierarchyContainer}>
            {categoriesWithSubs.map((category) => (
              <CategoryHierarchySection key={category.id} category={category} />
            ))}
          </View>
        ) : (
          <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.m }]}>Категории</Text>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Умная шапка: приветствие скрывается при скролле */}
      <View style={styles.header}>
        {/* Анимированная строка приветствия + адрес */}
        <Animated.View style={{ height: greetingHeight, opacity: greetingOpacity, overflow: 'hidden' }}>
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
          <Ionicons name="search" size={20} color={Colors.light.textLight} style={styles.searchIcon} />
          <Text style={styles.searchInputText}>Найти яблоки, молоко...</Text>
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
        ListHeaderComponent={<ListHeader />}
        renderItem={() => null} // Рендер происходит в ListHeader
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    paddingHorizontal: Spacing.m,
    paddingTop: 54,
    paddingBottom: Spacing.m,
    backgroundColor: '#fff',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    zIndex: 10,
  },

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
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.l, paddingHorizontal: Spacing.m, height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInputText: { flex: 1, fontSize: 16, color: Colors.light.textLight },

  listContainer: { paddingTop: Spacing.m, paddingBottom: 80 },
  hierarchyContainer: {
    paddingTop: 0,
  },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.l },
  // Баннеры
  bannersSection: { marginBottom: Spacing.xl, marginTop: Spacing.l },
  bannersScroll: { paddingHorizontal: Spacing.m },
  bannerCard: {
    width: SCREEN_WIDTH * 0.8, height: 160, marginRight: Spacing.m, borderRadius: Radius.xl,
    elevation: 6, shadowColor: Colors.light.primary, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 8 }, shadowRadius: 12,
  },
  bannerImage: { width: '100%', height: '100%', borderRadius: Radius.l },
  bannerTitle: {
    color: '#fff', fontSize: 20, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 },
    position: 'absolute', bottom: Spacing.m, left: Spacing.m, right: Spacing.m,
  },

  // Популярное
  popularSection: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.m, marginBottom: Spacing.s,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  seeAllText: { fontSize: 14, color: Colors.light.primary, fontWeight: '700' },
  popularScroll: { paddingHorizontal: Spacing.m },
  popularCard: {
    width: 130, marginRight: Spacing.m, backgroundColor: '#fff', borderRadius: Radius.xl,
    overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  popularImage: { width: '100%', height: 110 },
  popularInfo: { padding: Spacing.s },
  popularName: { fontSize: 13, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  popularPrice: { fontSize: 15, fontWeight: '800', color: Colors.light.primary },
});

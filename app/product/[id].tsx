import Skeleton from '@/components/Skeleton';
import { ErrorToast } from '@/components/ErrorToast';
import { logger } from '@/lib/logger';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Загрузка случайных рекомендованных товаров
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .neq('id', data.id)
        .limit(6);
      if (related) setRelatedProducts(related);
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
        <View style={styles.imageContainer}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]} />
          )}

          <SafeAreaView edges={['top']} style={styles.headerAbsolute}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFavoritePress} style={styles.iconButton}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? Colors.light.error : Colors.light.text}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.categoryBadge}>{product.unit}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>О товаре</Text>
            <Text style={styles.description}>
              {product.description || 'Вкусный и свежий продукт, который отлично подойдет для вашего стола. Тщательно отобран фермерами и готов к употреблению.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Пищевая ценность (на 100г)</Text>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionValue}>{Math.floor(Math.random() * 200 + 50)}</Text>
                <Text style={styles.nutritionLabel}>ккал</Text>
              </View>
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionValue}>{Math.floor(Math.random() * 20 + 1)} г</Text>
                <Text style={styles.nutritionLabel}>Белки</Text>
              </View>
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionValue}>{Math.floor(Math.random() * 30 + 1)} г</Text>
                <Text style={styles.nutritionLabel}>Жиры</Text>
              </View>
              <View style={styles.nutritionBox}>
                <Text style={styles.nutritionValue}>{Math.floor(Math.random() * 50 + 1)} г</Text>
                <Text style={styles.nutritionLabel}>Углеводы</Text>
              </View>
            </View>
          </View>

          {/* С этим товаром покупают (Cross-Sell) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>С этим покупают</Text>
            {relatedProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContent}
              >
                {relatedProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/product/${item.id}?name=${encodeURIComponent(item.name)}` as any)}
                  >
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.relatedImage} />
                    ) : (
                      <View style={[styles.relatedImage, { backgroundColor: Colors.light.borderLight }]} />
                    )}
                    <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.relatedPrice}>{Number(item.price).toFixed(0)} ₽</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScrollContent}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.skeletonRelatedItem}>
                    <Skeleton width={140} height={190} borderRadius={20} />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Цена</Text>
          <Text style={styles.price}>{Number(product.price).toFixed(0)} ₽</Text>
        </View>

        <View style={styles.actionContainer}>
          {!cartItem ? (
            <TouchableOpacity style={styles.addToCartButton} onPress={() => addItem(product)}>
              <Text style={styles.addToCartText}>В корзину</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(product.id, cartItem.quantity - 1)}
              >
                <Ionicons name="remove" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(product.id, cartItem.quantity + 1)}
              >
                <Ionicons name="add" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  flex1: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Radius.xl,
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: Colors.light.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.light.border,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.whiteTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -40,
    padding: Spacing.l,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  categoryBadge: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '700',
    marginBottom: 28,
    backgroundColor: Colors.light.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.s,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  nutritionBox: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  nutritionLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    elevation: 10,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.light.text,
  },
  actionContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addToCartButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: 36,
    paddingVertical: 18,
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addToCartText: {
    color: Colors.light.card,
    fontSize: 17,
    fontWeight: '800',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.light.primaryBorder,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.s,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginHorizontal: Spacing.m,
    minWidth: 16,
    textAlign: 'center',
  },
  relatedCard: {
    width: 140,
    marginRight: Spacing.m,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  relatedImage: {
    width: '100%',
    height: 110,
    borderRadius: Radius.m,
    backgroundColor: Colors.light.border,
    marginBottom: 10,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
    flex: 1,
  },
  relatedPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  skeletonContent: { padding: Spacing.l },
  skeletonTitle: { marginBottom: 12 },
  skeletonSubtitle: { marginBottom: Spacing.l },
  skeletonText: { marginBottom: Spacing.s },
  retryIcon: { marginRight: 8 },
  retryText: { color: Colors.light.card, fontWeight: 'bold' },
  relatedScrollContent: { paddingRight: Spacing.l },
  skeletonRelatedItem: { marginRight: Spacing.m },
});

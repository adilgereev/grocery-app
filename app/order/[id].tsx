import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '@/components/Skeleton';
import { logger } from '@/lib/logger';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { cleanAddress } from '@/lib/address';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';

// Конфигурация статусов заказа
const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: 'Собираем заказ', icon: 'cube-outline',           color: Colors.light.info, bg: Colors.light.infoLight, emoji: '📦' },
  processing: { label: 'Собираем заказ', icon: 'cube-outline',           color: Colors.light.info, bg: Colors.light.infoLight, emoji: '📦' },
  shipped:    { label: 'Курьер в пути',  icon: 'bicycle-outline',        color: Colors.light.info, bg: Colors.light.infoLight, emoji: '🚗' },
  delivered:  { label: 'Доставлен',      icon: 'checkmark-done-outline', color: Colors.light.success, bg: Colors.light.successLight, emoji: '✅' },
  cancelled:  { label: 'Отменён',        icon: 'close-circle-outline',   color: Colors.light.error, bg: Colors.light.errorLight, emoji: '❌' },
};

// Конфигурация способов оплаты
const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline' },
  online: { label: 'Онлайн', icon: 'card' },
};

// Шаги трекера (без ожидания — сразу сборка)
const TRACKER_STEPS = ['processing', 'shipped', 'delivered'];

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentMethod = 'online' | 'cash';

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  payment_method?: PaymentMethod;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product?: Product | { name: string; image_url?: string };
}

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const addItemsBatch = useCartStore(state => state.addItemsBatch);

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Параллельный запрос заказа и его позиций
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase
          .from('order_items')
          .select('*, product:product_id(*)')
          .eq('order_id', id)
      ]);

      if (orderRes.error) throw orderRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setOrder(orderRes.data);
      setOrderItems(itemsRes.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить детали заказа';
      logger.error('Ошибка загрузки деталей заказа:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();

      // Подписка на Realtime обновления статуса заказа
      const channel = supabase.channel(`order_details_${id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        }, () => {
          fetchOrderDetails();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, fetchOrderDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRepeatOrder = () => {
    if (!orderItems.length) return;
    const batch = orderItems
      .filter(item => item.product !== undefined)
      .map(item => ({
        product: item.product as Product,
        quantity: item.quantity
      }));
    addItemsBatch(batch);
    router.navigate('/(tabs)/(cart)' as any);
  };

  // Скелетон загрузки
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={150} height={24} borderRadius={Radius.s} />
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={120} borderRadius={Radius.xl} style={styles.skeletonLarge} />
          <Skeleton width="100%" height={80} borderRadius={Radius.l} style={styles.skeletonMedium} />
          <Skeleton width="100%" height={80} borderRadius={Radius.l} />
        </View>
      </View>
    );
  }

  // Заказ не найден
  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
        <Text style={styles.errorText}>{error || 'Заказ не найден'}</Text>
        <TouchableOpacity style={styles.retryButtonCenter} onPress={() => fetchOrderDetails()}>
          {loading ? (
            <ActivityIndicator color={Colors.light.card} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={Colors.light.card} style={styles.retryIcon} />
              <Text style={styles.retryButtonText}>Повторить</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButtonCenter} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = order.status?.toLowerCase() || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isCancelled = status === 'cancelled';
  const currentStepIndex = status === 'pending' ? 0 : TRACKER_STEPS.indexOf(status);

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Заказ №{order.id.substring(0, 8).toUpperCase()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Баннер статуса */}
        <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>  
          <Text style={styles.statusEmoji}>{config.emoji}</Text>
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.statusDate}>{formatDate(order.created_at)}</Text>
        </View>

        {/* Трекер прогресса (скрыт при отмене) */}
        {!isCancelled && (
          <View style={styles.trackerCard}>
            <View style={styles.trackerRow}>
              {TRACKER_STEPS.map((step, index) => {
                const stepConfig = STATUS_CONFIG[step];
                const isActive = index <= currentStepIndex;
                const isLast = index === TRACKER_STEPS.length - 1;
                return (
                  <React.Fragment key={step}>
                    <View style={styles.trackerStep}>
                      <View style={[
                        styles.trackerDot,
                        isActive 
                          ? { backgroundColor: config.color, borderColor: config.color }
                          : styles.trackerDotInactive
                      ]}>
                        <Ionicons
                          name={stepConfig.icon as keyof typeof Ionicons.glyphMap}
                          size={16}
                          color={isActive ? Colors.light.card : Colors.light.textLight}
                        />
                      </View>
                      <Text style={[
                        styles.trackerLabel,
                        { color: isActive ? Colors.light.text : Colors.light.textLight }
                      ]}>{stepConfig.label.split(' ')[0]}</Text>
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.trackerLine,
                        { backgroundColor: index < currentStepIndex ? config.color : Colors.light.border }
                      ]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Адрес доставки */}
        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.addressTitle}>Адрес доставки</Text>
            <Text style={styles.addressText}>{cleanAddress(order.delivery_address)}</Text>
          </View>
        </View>

        {/* Способ оплаты */}
        {order.payment_method && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentIconContainer}>
              <Ionicons
                name={PAYMENT_CONFIG[order.payment_method].icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.paymentTitle}>Способ оплаты</Text>
              <Text style={styles.paymentText}>{PAYMENT_CONFIG[order.payment_method].label}</Text>
            </View>
          </View>
        )}

        {/* Список товаров */}
        <Text style={styles.sectionTitle}>Товары · {orderItems.length} шт</Text>

        <View style={styles.itemsCard}>
          {orderItems.map((item, index) => (
            <View key={item.id}>
              <View style={styles.productRow}>
                {item.product?.image_url ? (
                  <Image source={{ uri: item.product.image_url }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder} />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.product?.name || 'Товар'}</Text>
                  <Text style={styles.productQty}>{item.quantity} шт × {item.price_at_time} ₽</Text>
                </View>
                <Text style={styles.productPrice}>{Number(item.quantity * item.price_at_time).toFixed(0)} ₽</Text>
              </View>
              {index < orderItems.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Итого + кнопка */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalItems}>Товары ({orderItems.length})</Text>
            <Text style={styles.totalItemsPrice}>{Number(order.total_amount).toFixed(0)} ₽</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalItems}>Доставка</Text>
            <Text style={styles.totalFree}>Бесплатно</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalPrice}>{Number(order.total_amount).toFixed(0)} ₽</Text>
          </View>

          {/* Кнопка повтора внутри карточки итого */}
          <TouchableOpacity style={styles.repeatButton} onPress={handleRepeatOrder}>
            <Ionicons name="bag-handle-outline" size={20} color={Colors.light.card} style={styles.repeatIcon} />
            <Text style={styles.repeatButtonText}>Повторить покупку</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { padding: Spacing.m },
  skeletonLarge: { marginBottom: 20 },
  skeletonMedium: { marginBottom: 16 },

  // Шапка
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.l, paddingTop: 60,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
    elevation: 4, 
    shadowColor: Colors.light.text, 
    shadowOpacity: 0.05, 
    shadowOffset: { width: 0, height: 4 }, 
    zIndex: 10,
  },
  headerSpacer: { width: 24 },
  backButton: { padding: Spacing.s, marginRight: Spacing.s },
  title: { fontSize: 18, fontWeight: '800', color: Colors.light.text },

  scrollContent: { padding: Spacing.m },

  // Баннер статуса
  statusBanner: {
    borderRadius: Radius.xl, padding: Spacing.l, alignItems: 'center', marginBottom: Spacing.m,
  },
  statusEmoji: { fontSize: 48, marginBottom: Spacing.s },
  statusLabel: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statusDate: { fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500' },

  // Трекер
  trackerCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.l, marginBottom: Spacing.m,
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  trackerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  trackerStep: { alignItems: 'center', width: 64 },
  trackerDot: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, marginBottom: 6,
  },
  trackerDotInactive: { backgroundColor: Colors.light.card, borderColor: Colors.light.border },
  trackerLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  trackerLine: { flex: 1, height: 3, marginTop: 16, marginHorizontal: -4, borderRadius: 2 },

  // Адрес
  addressCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.l,
    flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  addressIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.m,
  },
  addressTitle: { fontSize: 12, color: Colors.light.textLight, fontWeight: '600', marginBottom: 2 },
  addressText: { fontSize: 14, color: Colors.light.text, fontWeight: '600', lineHeight: 20 },

  // Способ оплаты
  paymentCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.l,
    flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  paymentIconContainer: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.m,
  },
  paymentTitle: { fontSize: 12, color: Colors.light.textLight, fontWeight: '600', marginBottom: 2 },
  paymentText: { fontSize: 14, color: Colors.light.text, fontWeight: '600', lineHeight: 20 },

  // Секция
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text, marginBottom: Spacing.s },

  // Товары
  itemsCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.m,
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.s },
  productImage: { width: 56, height: 56, borderRadius: Radius.m, marginRight: Spacing.m },
  productImagePlaceholder: { width: 56, height: 56, borderRadius: Radius.m, marginRight: Spacing.m, backgroundColor: Colors.light.borderLight },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  productQty: { fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500' },
  productPrice: { fontSize: 15, fontWeight: '800', color: Colors.light.text, marginLeft: Spacing.s },
  itemDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 72 },

  // Итого
  totalCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.l, marginBottom: Spacing.m,
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  totalItems: { fontSize: 14, color: Colors.light.textSecondary, fontWeight: '500' },
  totalItemsPrice: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  totalFree: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  totalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginVertical: Spacing.s },
  totalLabel: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  totalPrice: { fontSize: 20, fontWeight: '900', color: Colors.light.primary },

  // Кнопка повтора
  repeatButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: Radius.l, marginTop: Spacing.l,
  },
  repeatIcon: { marginRight: 8 },
  repeatButtonText: { color: Colors.light.card, fontSize: 16, fontWeight: '700' },

  // Универсальные
  flex1: { flex: 1 },
  footerSpacer: { height: Spacing.xl },

  // Пустое состояние
  errorText: { fontSize: 18, color: Colors.light.textSecondary, marginTop: Spacing.m, marginBottom: 20, fontWeight: '500', textAlign: 'center' },
  retryButtonCenter: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l, marginBottom: Spacing.m },
  retryIcon: { marginRight: 8 },
  retryButtonText: { color: Colors.light.card, fontSize: 16, fontWeight: '600' },
  backButtonCenter: { backgroundColor: Colors.light.primary, paddingHorizontal: Spacing.l, paddingVertical: 14, borderRadius: Radius.m },
  backButtonText: { color: Colors.light.card, fontWeight: 'bold', fontSize: 16 },
});

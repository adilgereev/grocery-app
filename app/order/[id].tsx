import OrderItemRow from '@/components/order/OrderItemRow';
import OrderSection from '@/components/order/OrderSection';
import OrderStatusBanner from '@/components/order/OrderStatusBanner';
import OrderTracker from '@/components/order/OrderTracker';
import Skeleton from '@/components/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { cleanAddress } from '@/lib/address';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Конфигурация статусов заказа. Описывает лейблы, иконки и цвета для UI.
 */
const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: 'Собираем заказ', icon: 'cube-outline',           color: Colors.light.info, bg: Colors.light.infoLight, emoji: '📦' },
  processing: { label: 'Собираем заказ', icon: 'cube-outline',           color: Colors.light.info, bg: Colors.light.infoLight, emoji: '📦' },
  shipped:    { label: 'Курьер в пути',  icon: 'bicycle-outline',        color: Colors.light.info, bg: Colors.light.infoLight, emoji: '🚗' },
  delivered:  { label: 'Доставлен',      icon: 'checkmark-done-outline', color: Colors.light.success, bg: Colors.light.successLight, emoji: '✅' },
  cancelled:  { label: 'Отменён',        icon: 'close-circle-outline',   color: Colors.light.error, bg: Colors.light.errorLight, emoji: '❌' },
};

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: 'Наличными курьеру', icon: 'cash-outline' },
  online: { label: 'Онлайн', icon: 'card' },
};

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

/**
 * Страница деталей заказа.
 * Показывает статус, трекер, состав заказа и позволяет повторить покупку.
 */
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
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase.from('order_items').select('*, product:product_id(*)').eq('order_id', id)
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
      const channel = supabase.channel(`order_details_${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, fetchOrderDetails)
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [id, fetchOrderDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRepeatOrder = () => {
    if (!orderItems.length) return;
    const batch = orderItems
      .filter(item => item.product !== undefined)
      .map(item => ({ product: item.product as Product, quantity: item.quantity }));
    addItemsBatch(batch);
    router.navigate('/(tabs)/(cart)' as any);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}><Skeleton width={150} height={24} borderRadius={Radius.s} /></View>
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={120} borderRadius={Radius.xl} style={styles.skeletonLarge} />
          <Skeleton width="100%" height={80} borderRadius={Radius.l} style={styles.skeletonMedium} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
        <Text style={styles.errorText}>{error || 'Заказ не найден'}</Text>
        <TouchableOpacity style={styles.retryButtonCenter} onPress={fetchOrderDetails}>
          <Ionicons name="refresh-outline" size={20} color={Colors.light.card} style={styles.retryIcon} />
          <Text style={styles.retryButtonText}>Повторить</Text>
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
      {/* Кастомная шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Заказ №{order.id.substring(0, 8).toUpperCase()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Баннер статуса */}
        <OrderStatusBanner status={status} config={config} date={formatDate(order.created_at)} />

        {/* Трекер (если не отменен) */}
        {!isCancelled && (
          <OrderTracker
            steps={TRACKER_STEPS}
            currentStepIndex={currentStepIndex}
            statusConfigs={STATUS_CONFIG}
            accentColor={config.color}
          />
        )}

        {/* Адрес */}
        <OrderSection title="Адрес доставки" subtitle={cleanAddress(order.delivery_address)} icon="location" />

        {/* Оплата */}
        {order.payment_method && (
          <OrderSection
            title="Способ оплаты"
            subtitle={PAYMENT_CONFIG[order.payment_method].label}
            icon={PAYMENT_CONFIG[order.payment_method].icon as any}
          />
        )}

        {/* Товары */}
        <Text style={styles.sectionTitle}>Товары · {orderItems.length} шт</Text>
        <View style={styles.itemsCard}>
          {orderItems.map((item, index) => (
            <OrderItemRow key={item.id} item={item} isLast={index === orderItems.length - 1} />
          ))}
        </View>

        {/* Итог и Повтор */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalItems}>Товары ({orderItems.length})</Text>
            <Text style={styles.totalItemsPrice}>{Number(order.total_amount).toFixed(0)} ₽</Text>
          </View>
          <View style={styles.totalRow}><Text style={styles.totalItems}>Доставка</Text><Text style={styles.totalFree}>Бесплатно</Text></View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Итого</Text><Text style={styles.totalPrice}>{Number(order.total_amount).toFixed(0)} ₽</Text></View>
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingContainer: { padding: Spacing.m },
  skeletonLarge: { marginBottom: 20 },
  skeletonMedium: { marginBottom: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.l, paddingTop: 60, backgroundColor: Colors.light.card,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
    elevation: 0, shadowColor: Colors.light.text, shadowOpacity: 0.02, shadowOffset: { width: 0, height: 4 }, zIndex: 10,
  },
  headerSpacer: { width: 24 },
  backButton: { padding: Spacing.s, marginRight: Spacing.s },
  title: { fontSize: 18, fontWeight: '700', color: Colors.light.text },

  scrollContent: { padding: Spacing.m },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: Spacing.s },

  itemsCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.m,
    elevation: 0, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },

  totalCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.l, marginBottom: Spacing.m,
    elevation: 0, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  totalItems: { fontSize: 14, color: Colors.light.textSecondary, fontWeight: '500' },
  totalItemsPrice: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  totalFree: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  totalDivider: { height: 1, backgroundColor: Colors.light.borderLight, marginVertical: Spacing.s },
  totalLabel: { fontSize: 18, fontWeight: '700', color: Colors.light.text },
  totalPrice: { fontSize: 20, fontWeight: '700', color: Colors.light.primary },

  repeatButton: {
    backgroundColor: Colors.light.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: Radius.pill, marginTop: Spacing.l,
  },
  repeatIcon: { marginRight: 8 },
  repeatButtonText: { color: Colors.light.card, fontSize: 16, fontWeight: '700' },

  footerSpacer: { height: Spacing.xl },
  errorText: { fontSize: 18, color: Colors.light.textSecondary, marginTop: Spacing.m, marginBottom: 20, fontWeight: '500', textAlign: 'center' },
  retryButtonCenter: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l },
  retryIcon: { marginRight: 8 },
  retryButtonText: { color: Colors.light.card, fontSize: 16, fontWeight: '600' },
});

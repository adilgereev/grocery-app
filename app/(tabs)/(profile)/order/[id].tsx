import OrderItemRow from '@/components/order/OrderItemRow';
import OrderSection from '@/components/order/OrderSection';
import OrderStatusBanner from '@/components/order/OrderStatusBanner';
import OrderTracker from '@/components/order/OrderTracker';
import OrderDetailsHeader from '@/components/order/OrderDetailsHeader';
import OrderDetailsLoadingState from '@/components/order/OrderDetailsLoadingState';
import ErrorState from '@/components/ui/ErrorState';
import OrderTotalCard from '@/components/order/OrderTotalCard';
import OrderStatusHistory from '@/components/order/OrderStatusHistory';
import { STATUS_CONFIG, PAYMENT_CONFIG, TRACKER_STEPS } from '@/components/order/orderConfig';
import { Colors, Spacing, Shadows, Radius } from '@/constants/theme';
import { cleanAddress } from '@/lib/utils/addressUtils';
import { useOrderDetails } from '@/hooks/domain/useOrderDetails';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const { order, orderItems, statusHistory, loading, error, fetchOrderDetails, formatDate, handleRepeatOrder } = useOrderDetails(id);

  if (loading) {
    return <OrderDetailsLoadingState />;
  }

  if (!order) {
    return <ErrorState error={error ?? 'Заказ не найден'} onRetry={fetchOrderDetails} />;
  }

  const status = order.status?.toLowerCase() || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isCancelled = status === 'cancelled';
  const currentStepIndex = status === 'pending' ? 0 : TRACKER_STEPS.indexOf(status);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <OrderDetailsHeader orderId={order.id} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OrderStatusBanner status={status} config={config} date={formatDate(order.created_at ?? '')} />

        {!isCancelled && (
          <OrderTracker
            steps={TRACKER_STEPS}
            currentStepIndex={currentStepIndex}
            statusConfigs={STATUS_CONFIG}
            accentColor={config.color}
          />
        )}

        <OrderSection title="Адрес доставки" subtitle={cleanAddress(order.delivery_address)} icon="location" />

        {order.payment_method && (
          <OrderSection
            title="Способ оплаты"
            subtitle={PAYMENT_CONFIG[order.payment_method].label}
            icon={PAYMENT_CONFIG[order.payment_method].icon}
          />
        )}

        {order.comment && (
          <OrderSection title="Комментарий к заказу" subtitle={order.comment} icon="chatbubble-ellipses-outline" />
        )}

        <Text style={styles.sectionTitle}>Товары · {orderItems.length} шт</Text>
        <View style={styles.itemsCard}>
          {orderItems.map((item, index) => (
            <OrderItemRow key={item.id} item={item} isLast={index === orderItems.length - 1} />
          ))}
        </View>

        <OrderTotalCard totalAmount={order.total_amount} itemCount={orderItems.length} onRepeat={handleRepeatOrder} />
        {statusHistory.length > 0 && <OrderStatusHistory history={statusHistory} />}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { padding: Spacing.m },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: Spacing.s },
  itemsCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  footerSpacer: { height: Spacing.xl },
});

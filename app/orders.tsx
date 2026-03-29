import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '@/components/Skeleton';
import { ErrorToast } from '@/components/ErrorToast';
import { logger } from '@/lib/logger';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { cleanAddress } from '@/lib/address';
import { Order } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';

// Конфигурация статусов (синхронизирована с order/[id].tsx)
const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: 'Собираем',   emoji: '📦', color: Colors.light.info, bg: Colors.light.infoLight },
  processing: { label: 'Собираем',   emoji: '📦', color: Colors.light.info, bg: Colors.light.infoLight },
  shipped:    { label: 'В пути',     emoji: '🚗', color: Colors.light.info, bg: Colors.light.infoLight },
  delivered:  { label: 'Доставлен',  emoji: '✅', color: Colors.light.success, bg: Colors.light.successLight },
  cancelled:  { label: 'Отменён',    emoji: '❌', color: Colors.light.error, bg: Colors.light.errorLight },
};

export default function OrdersScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить заказы';
      logger.error('Ошибка загрузки заказов:', err);
      setError(errorMessage);
      ErrorToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) {
        fetchOrders();

        // Подписка на Realtime обновления заказов
        const channel = supabase.channel('user_orders')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${session.user.id}`
          }, () => {
            fetchOrders();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [session, fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Скелетон загрузки
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScreenHeader title="Мои заказы" />
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={Radius.xl} style={styles.skeletonItem} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Мои заказы" />

      {error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders()}>
            {loading ? (
              <ActivityIndicator color={Colors.light.card} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color={Colors.light.card} style={styles.retryIcon} />
                <Text style={styles.retryButtonText}>Повторить</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={80} color={Colors.light.icon} />
          <Text style={styles.emptyText}>У вас пока нет заказов</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />
          }
          renderItem={({ item }) => {
            const status = item.status?.toLowerCase() || 'pending';
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

            return (
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/order/${item.id}`)}
              >
                {/* Верхняя строка: эмодзи + статус + стрелка */}
                <View style={styles.topRow}>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>  
                    <Text style={styles.statusEmoji}>{config.emoji}</Text>
                    <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
                </View>

                {/* Адрес */}
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={15} color={Colors.light.textSecondary} />
                  <Text style={styles.addressText} numberOfLines={1}>{cleanAddress(item.delivery_address)}</Text>
                </View>

                {/* Нижняя строка: дата + сумма */}
                <View style={styles.bottomRow}>
                  <Text style={styles.dateText}>{item.created_at ? formatDate(item.created_at) : ''}</Text>
                  <Text style={styles.totalText}>{Number(item.total_amount).toFixed(0)} ₽</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  listContainer: { paddingHorizontal: Spacing.m, paddingBottom: 20, paddingTop: Spacing.m, flexGrow: 1 },
  emptyText: { fontSize: 18, color: Colors.light.textLight, marginTop: 20, fontWeight: '500' },
  errorTitle: { fontSize: 20, fontWeight: '700', color: Colors.light.text, marginTop: Spacing.m, marginBottom: Spacing.s },
  errorMessage: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.l },
  retryButton: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l },
  retryButtonText: { color: Colors.light.card, fontSize: 16, fontWeight: '600' },
  retryIcon: { marginRight: 8 },
  skeletonItem: { marginBottom: 12 },

  // Карточка заказа
  orderCard: {
    backgroundColor: Colors.light.card, borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.m,
    elevation: 1, shadowColor: Colors.light.text, shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },

  // Верхняя строка
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill,
  },
  statusEmoji: { fontSize: 16, marginRight: 6 },
  statusLabel: { fontSize: 14, fontWeight: '700' },

  // Адрес
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s },
  addressText: { fontSize: 14, color: Colors.light.textSecondary, marginLeft: 6, flex: 1, fontWeight: '500' },

  // Нижняя строка
  bottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s,
  },
  dateText: { fontSize: 13, color: Colors.light.textLight, fontWeight: '500' },
  totalText: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
});

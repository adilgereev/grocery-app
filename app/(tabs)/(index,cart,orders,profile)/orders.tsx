import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '@/components/Skeleton';
import { ErrorToast } from '@/components/ErrorToast';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { cleanAddress } from '@/lib/address';
import { Order } from '@/types';

// Конфигурация статусов (синхронизирована с order/[id].tsx)
const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: 'Собираем',   emoji: '📦', color: '#6366F1', bg: '#EEF2FF' },
  processing: { label: 'Собираем',   emoji: '📦', color: '#6366F1', bg: '#EEF2FF' },
  shipped:    { label: 'В пути',     emoji: '🚗', color: '#3B82F6', bg: '#EFF6FF' },
  delivered:  { label: 'Доставлен',  emoji: '✅', color: '#10B981', bg: '#ECFDF5' },
  cancelled:  { label: 'Отменён',    emoji: '❌', color: '#EF4444', bg: '#FEF2F2' },
};

export default function OrdersScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    }, [session])
  );

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить заказы';
      console.error('Ошибка загрузки заказов:', err);
      setError(errorMessage);
      ErrorToast({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мои заказы</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={100} borderRadius={20} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мои заказы</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders()}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
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
                  <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                  <Text style={styles.totalText}>{Number(item.total_amount).toFixed(0)} ₽</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  
  // Шапка
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.l, paddingTop: 60, paddingBottom: Spacing.m,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  backButton: { padding: Spacing.xs },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  listContainer: { paddingHorizontal: Spacing.m, paddingBottom: 20, paddingTop: Spacing.m, flexGrow: 1 },
  emptyText: { fontSize: 18, color: Colors.light.textLight, marginTop: 20, fontWeight: '500' },
  errorTitle: { fontSize: 20, fontWeight: '700', color: Colors.light.text, marginTop: Spacing.m, marginBottom: Spacing.s },
  errorMessage: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.l },
  retryButton: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Карточка заказа
  orderCard: {
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.m, marginBottom: Spacing.m,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
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

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/services/supabase';
import { fetchOrders as fetchOrdersApi } from '@/lib/api/orderApi';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '@/components/ui/Skeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { logger } from '@/lib/utils/logger';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Order } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ui/ScreenHeader';
import OrderCard from '@/components/order/OrderCard';

// Конфигурация статусов теперь в OrderCard.tsx


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
      const data = await fetchOrdersApi(session.user.id);
      setOrders(data);
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

  // formatDate перенесен в OrderCard.tsx


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
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color={Colors.light.white} style={styles.retryIcon} />
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
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={(orderId) => router.push(`/order/${orderId}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  listContainer: { paddingHorizontal: Spacing.m, paddingBottom: Spacing.ml, paddingTop: Spacing.m, flexGrow: 1 },
  emptyText: { fontSize: 18, color: Colors.light.textLight, marginTop: Spacing.ml, fontWeight: '500' },
  errorTitle: { fontSize: 20, fontWeight: '700', color: Colors.light.text, marginTop: Spacing.m, marginBottom: Spacing.s },
  errorMessage: { fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.l },
  retryButton: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.m, borderRadius: Radius.l },
  retryButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '600' },
  retryIcon: { marginRight: 8 },
  skeletonItem: { marginBottom: Spacing.sm },

  // OrderCard styles moved to OrderCard.tsx
});

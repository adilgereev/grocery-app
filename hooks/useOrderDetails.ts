import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { fetchOrderDetails as fetchOrderDetailsApi, OrderItem } from '@/lib/api/orderApi';
import { supabase } from '@/lib/services/supabase';
import { useCartStore } from '@/store/cartStore';
import { Product, Order } from '@/types';
import { logger } from '@/lib/utils/logger';

interface UseOrderDetailsReturn {
  order: Order | null;
  orderItems: OrderItem[];
  loading: boolean;
  error: string | null;
  fetchOrderDetails: () => Promise<void>;
  formatDate: (dateString: string) => string;
  handleRepeatOrder: () => void;
}

export function useOrderDetails(id: string): UseOrderDetailsReturn {
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
      const result = await fetchOrderDetailsApi(id);
      setOrder(result.order);
      setOrderItems(result.items || []);
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

  return { order, orderItems, loading, error, fetchOrderDetails, formatDate, handleRepeatOrder };
}

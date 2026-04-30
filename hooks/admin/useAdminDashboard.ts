import { fetchPendingOrdersCount } from '@/lib/api/adminApi';
import { supabase } from '@/lib/services/supabase';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useAdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const count = await fetchPendingOrdersCount();
      setPendingCount(count);
    } catch {
      // Ошибка загрузки счётчика заказов
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCount();
    }, [loadCount]),
  );

  useEffect(() => {
    const channel = supabase
      .channel('admin_dashboard_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        loadCount,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCount]);

  return { pendingCount };
}

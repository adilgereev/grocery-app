import { useEffect, useRef } from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/services/supabase';
import { notifyOrderStatus, NOTIFY_STATUSES } from '@/lib/services/NotificationService';

// Глобальная Realtime-подписка на заказы текущего пользователя.
// Fallback для push-уведомлений когда приложение открыто/свёрнуто.
// lastNotifiedStatus трекает уже отправленные уведомления — защита от дублей
// при UPDATE несвязанных полей (payload.old не содержит status без REPLICA IDENTITY FULL).
export function useOrderStatusListener() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const lastNotifiedStatus = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!userId) return;

    lastNotifiedStatus.current = undefined;

    const channel = supabase
      .channel(`order-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          if (
            (NOTIFY_STATUSES as readonly string[]).includes(newStatus) &&
            newStatus !== lastNotifiedStatus.current
          ) {
            lastNotifiedStatus.current = newStatus;
            notifyOrderStatus(newStatus);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);
}

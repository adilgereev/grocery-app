import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { OrdersTable } from '@/features/orders/OrdersTable';
import {
  fetchAllOrdersWithDetails,
  fetchStaffByType,
} from '@/lib/adminApi';
import type { AdminOrderItem, AdminOrderWithDetails, StaffMember } from '@/lib/adminApi';
import type { Order } from '@/types';
import { supabase } from '@/lib/supabase';

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickers, setPickers] = useState<StaffMember[]>([]);
  const [couriers, setCouriers] = useState<StaffMember[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, pickerList, courierList] = await Promise.all([
        fetchAllOrdersWithDetails(),
        fetchStaffByType('picker'),
        fetchStaffByType('courier'),
      ]);
      setOrders(data);
      setPickers(pickerList);
      setCouriers(courierList);
    } catch {
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('admin_orders_biz')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  function handleUpdated(id: string, status: Order['status']) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  function handleItemsChanged(orderId: string, updatedItems: AdminOrderItem[], newTotal: number) {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, items: updatedItems, total_amount: newTotal } : o)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Заказы</h2>
          <p className="text-sm text-muted-foreground">{orders.length} заказов • обновляется в реальном времени</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <OrdersTable
          orders={orders}
          pickers={pickers}
          couriers={couriers}
          onUpdated={handleUpdated}
          onItemsChanged={handleItemsChanged}
        />
      )}
    </div>
  );
}

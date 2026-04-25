import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { updateOrderStatus } from '@/lib/adminApi';
import type { AdminOrderItem, AdminOrderWithDetails, StaffMember } from '@/lib/adminApi';
import type { Order } from '@/types';
import { toast } from 'sonner';
import { OrderRow } from './OrderRow';

interface OrdersTableProps {
  orders: AdminOrderWithDetails[];
  pickers: StaffMember[];
  couriers: StaffMember[];
  onUpdated: (id: string, status: Order['status']) => void;
  onItemsChanged: (orderId: string, updatedItems: AdminOrderItem[], newTotal: number) => void;
}

export function OrdersTable({ orders, pickers, couriers, onUpdated, onItemsChanged }: OrdersTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: Order['status']) {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      onUpdated(orderId, status);
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления статуса');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>№ заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Изменить статус</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Заказов пока нет
                </TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  pickers={pickers}
                  couriers={couriers}
                  isUpdating={updating === order.id}
                  onStatusChange={handleStatusChange}
                  onItemsChanged={onItemsChanged}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">{orders.length} заказов</div>
    </div>
  );
}

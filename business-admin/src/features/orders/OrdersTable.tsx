import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge, STATUS_CONFIG } from './OrderStatusBadge';
import { updateOrderStatus } from '@/lib/adminApi';
import type { AdminOrderWithDetails } from '@/lib/adminApi';
import type { Order } from '@/types';
import { toast } from 'sonner';

interface OrdersTableProps {
  orders: AdminOrderWithDetails[];
  onUpdated: (id: string, status: Order['status']) => void;
}

function getProfile(profiles: AdminOrderWithDetails['profiles']) {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export function OrdersTable({ orders, onUpdated }: OrdersTableProps) {
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
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Заказов пока нет
                </TableCell>
              </TableRow>
            ) : orders.map(order => {
              const profile = getProfile(order.profiles);
              return (
                <TableRow key={order.id}>
                  {/* № заказа */}
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  {/* Клиент */}
                  <TableCell>
                    <div className="text-sm font-medium">
                      {profile
                        ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Без имени'
                        : '—'}
                    </div>
                    {profile?.phone && (
                      <div className="text-xs text-muted-foreground">{profile.phone}</div>
                    )}
                  </TableCell>
                  {/* Адрес */}
                  <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                    {order.delivery_address}
                  </TableCell>
                  {/* Сумма */}
                  <TableCell className="font-medium">
                    {order.total_amount.toLocaleString('ru')} ₽
                  </TableCell>
                  {/* Текущий статус */}
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  {/* Смена статуса */}
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={v => handleStatusChange(order.id, v as Order['status'])}
                      disabled={updating === order.id}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_CONFIG) as Order['status'][]).map(s => (
                          <SelectItem key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  {/* Дата */}
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString('ru', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">{orders.length} заказов</div>
    </div>
  );
}

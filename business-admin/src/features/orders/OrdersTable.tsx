import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge, STATUS_CONFIG } from './OrderStatusBadge';
import { updateOrderStatus } from '@/lib/adminApi';
import type { AdminOrderWithDetails } from '@/lib/adminApi';
import type { Order } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  orders: AdminOrderWithDetails[];
  onUpdated: (id: string, status: Order['status']) => void;
}

function getProfile(profiles: AdminOrderWithDetails['profiles']) {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export function OrdersTable({ orders, onUpdated }: OrdersTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
            ) : orders.map(order => {
              const profile = getProfile(order.profiles);
              const isExpanded = expandedIds.has(order.id);

              return (
                <>
                  {/* Основная строка заказа */}
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedIds(prev => {
                      const next = new Set(prev);
                      isExpanded ? next.delete(order.id) : next.add(order.id);
                      return next;
                    })}
                  >
                    {/* Chevron */}
                    <TableCell>
                      <ChevronDown
                        className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-180')}
                      />
                    </TableCell>
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
                    {/* Смена статуса — stopPropagation чтобы не триггерить раскрытие */}
                    <TableCell onClick={e => e.stopPropagation()}>
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

                  {/* Раскрываемая строка с товарами и комментарием */}
                  {isExpanded && (
                    <TableRow key={`${order.id}-items`}>
                      <TableCell colSpan={8} className="bg-muted/30 p-0">
                        <div className="px-10 py-3">
                          {order.comment && (
                            <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>{order.comment}</span>
                            </div>
                          )}
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="py-1.5 text-left font-medium">Товар</th>
                                <th className="py-1.5 text-right font-medium">Кол-во</th>
                                <th className="py-1.5 text-right font-medium">Цена / шт.</th>
                                <th className="py-1.5 text-right font-medium">Итого</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                  <tr key={item.id} className="border-b border-border/30 last:border-0">
                                    <td className="py-2 font-medium">{item.product?.name ?? '—'}</td>
                                    <td className="py-2 text-right text-muted-foreground">
                                      {item.quantity}
                                      {item.product?.unit && (
                                        <span className="ml-1 text-xs text-muted-foreground/60">× {item.product.unit}</span>
                                      )}
                                    </td>
                                    <td className="py-2 text-right text-muted-foreground">
                                      {item.price_at_time.toLocaleString('ru')} ₽
                                    </td>
                                    <td className="py-2 text-right font-medium">
                                      {(item.quantity * item.price_at_time).toLocaleString('ru')} ₽
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="py-3 text-center text-muted-foreground">
                                    Нет данных о товарах
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">{orders.length} заказов</div>
    </div>
  );
}

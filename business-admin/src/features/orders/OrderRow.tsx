import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge, STATUS_CONFIG } from './OrderStatusBadge';
import type { AdminOrderWithDetails } from '@/lib/adminApi';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';

interface OrderRowProps {
  order: AdminOrderWithDetails;
  isUpdating: boolean;
  onStatusChange: (orderId: string, status: Order['status']) => Promise<void>;
}

function getProfile(profiles: AdminOrderWithDetails['profiles']) {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

/**
 * Отдельный компонент строки заказа для декомпозиции OrdersTable.
 */
export function OrderRow({ order, isUpdating, onStatusChange }: OrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const profile = getProfile(order.profiles);

  return (
    <>
      {/* Основная строка заказа */}
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Chevron */}
        <TableCell>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
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
              ? profile.first_name || 'Без имени'
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
            onValueChange={v => onStatusChange(order.id, v as Order['status'])}
            disabled={isUpdating}
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
        <TableRow>
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
}

import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge, STATUS_CONFIG } from './OrderStatusBadge';
import { OrderItemsTable } from './OrderItemsTable';
import type { AdminOrderItem, AdminOrderWithDetails } from '@/lib/adminApi';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';

interface OrderRowProps {
  order: AdminOrderWithDetails;
  isUpdating: boolean;
  onStatusChange: (orderId: string, status: Order['status']) => Promise<void>;
  onItemsChanged: (orderId: string, updatedItems: AdminOrderItem[], newTotal: number) => void;
}

function getProfile(profiles: AdminOrderWithDetails['profiles']) {
  return Array.isArray(profiles) ? profiles[0] : profiles;
}

export function OrderRow({ order, isUpdating, onStatusChange, onItemsChanged }: OrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const profile = getProfile(order.profiles);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </TableCell>
        <TableCell className="font-mono text-sm text-muted-foreground">
          #{order.id.slice(0, 8)}
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium">
            {profile ? profile.first_name || 'Без имени' : '—'}
          </div>
          {profile?.phone && (
            <div className="text-xs text-muted-foreground">{profile.phone}</div>
          )}
        </TableCell>
        <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
          {order.delivery_address}
        </TableCell>
        <TableCell className="font-medium">
          {order.total_amount.toLocaleString('ru')} ₽
        </TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} />
        </TableCell>
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
        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(order.created_at).toLocaleString('ru', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit',
          })}
        </TableCell>
      </TableRow>

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
              <OrderItemsTable
                order={order}
                onItemsChanged={(updatedItems, newTotal) =>
                  onItemsChanged(order.id, updatedItems, newTotal)
                }
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

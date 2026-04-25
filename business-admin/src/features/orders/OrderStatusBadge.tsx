import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types';

type OrderStatus = Order['status'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Новый',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  processing: {
    label: 'Сборка',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  assembled: {
    label: 'Собран',
    className: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  shipped: {
    label: 'В пути',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  delivered: {
    label: 'Доставлен',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Отменён',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };

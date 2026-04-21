import { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ReplaceItemDialog } from './ReplaceItemDialog';
import { deleteOrderItem, replaceOrderItem, type ReplacementSuggestion } from '@/lib/adminOrderItemApi';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminOrderItem, AdminOrderWithDetails } from '@/lib/adminApi';

const EDITABLE_STATUSES = new Set(['pending', 'processing']);

interface Props {
  order: AdminOrderWithDetails;
  onItemsChanged: (updatedItems: AdminOrderItem[], newTotal: number) => void;
}

export function OrderItemsTable({ order, onItemsChanged }: Props) {
  const { session } = useAuth();
  const [deletingItem, setDeletingItem] = useState<AdminOrderItem | null>(null);
  const [replacingItem, setReplacingItem] = useState<AdminOrderItem | null>(null);
  const [loading, setLoading] = useState(false);

  const canEdit = EDITABLE_STATUSES.has(order.status);
  const items = order.items ?? [];

  async function handleDelete() {
    if (!deletingItem || !session) return;
    const newTotal = order.total_amount - deletingItem.quantity * deletingItem.price_at_time;
    setLoading(true);
    try {
      await deleteOrderItem({
        itemId: deletingItem.id,
        orderId: order.id,
        productName: deletingItem.product?.name ?? '—',
        newTotal,
        currentStatus: order.status,
        adminId: session.user.id,
      });
      const updatedItems = items.filter(i => i.id !== deletingItem.id);
      onItemsChanged(updatedItems, newTotal);
      toast.success('Товар удалён из заказа');
    } catch {
      toast.error('Ошибка удаления товара');
    } finally {
      setLoading(false);
      setDeletingItem(null);
    }
  }

  async function handleReplace(replacement: ReplacementSuggestion) {
    if (!replacingItem || !session) return;
    const newTotal =
      order.total_amount -
      replacingItem.quantity * replacingItem.price_at_time +
      replacingItem.quantity * replacement.price;
    setLoading(true);
    try {
      await replaceOrderItem({
        itemId: replacingItem.id,
        orderId: order.id,
        newProductId: replacement.id,
        newPrice: replacement.price,
        newTotal,
        originalProductName: replacingItem.product?.name ?? '—',
        newProductName: replacement.name,
        currentStatus: order.status,
        adminId: session.user.id,
      });
      const updatedItems = items.map(i =>
        i.id === replacingItem.id
          ? { ...i, price_at_time: replacement.price, product: { ...i.product!, id: replacement.id, name: replacement.name, unit: replacement.unit, image_url: replacement.image_url, category_id: i.product?.category_id ?? null, price: replacement.price } }
          : i
      );
      onItemsChanged(updatedItems, newTotal);
      toast.success('Товар заменён');
    } catch {
      toast.error('Ошибка замены товара');
    } finally {
      setLoading(false);
      setReplacingItem(null);
    }
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-1.5 text-left font-medium">Товар</th>
            <th className="py-1.5 text-right font-medium">Кол-во</th>
            <th className="py-1.5 text-right font-medium">Цена / шт.</th>
            <th className="py-1.5 text-right font-medium">Итого</th>
            {canEdit && <th className="py-1.5 w-20" />}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map(item => (
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
                {canEdit && (
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        disabled={loading || !item.product?.category_id}
                        title={!item.product?.category_id ? 'Категория не указана' : 'Заменить товар'}
                        onClick={() => setReplacingItem(item)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        disabled={loading}
                        title="Удалить из заказа"
                        onClick={() => setDeletingItem(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canEdit ? 5 : 4} className="py-3 text-center text-muted-foreground">
                Нет данных о товарах
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={open => !open && setDeletingItem(null)}
        title="Удалить товар из заказа?"
        description={`«${deletingItem?.product?.name ?? '—'}» — ${((deletingItem?.quantity ?? 0) * (deletingItem?.price_at_time ?? 0)).toLocaleString('ru')} ₽`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
      />

      {replacingItem && (
        <ReplaceItemDialog
          item={replacingItem}
          open={!!replacingItem}
          onOpenChange={open => !open && setReplacingItem(null)}
          onSelect={handleReplace}
        />
      )}
    </>
  );
}

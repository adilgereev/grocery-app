import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  fetchReplacementSuggestions,
  type ReplacementSuggestion,
} from '@/lib/adminOrderItemApi';
import type { AdminOrderItem } from '@/lib/adminApi';

interface Props {
  item: AdminOrderItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (replacement: ReplacementSuggestion) => void;
}

function PriceDelta({ original, current }: { original: number; current: number }) {
  const delta = current - original;
  if (delta === 0) return null;
  const label = delta > 0 ? `+${delta.toLocaleString('ru')} ₽` : `${delta.toLocaleString('ru')} ₽`;
  return (
    <span className={delta > 0 ? 'text-xs text-amber-600' : 'text-xs text-emerald-600'}>
      {label}
    </span>
  );
}

export function ReplaceItemDialog({ item, open, onOpenChange, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<ReplacementSuggestion[] | null>(null);

  useEffect(() => {
    if (!open || !item.product?.category_id) return;

    fetchReplacementSuggestions(item.product.category_id, item.product.id, item.price_at_time)
      .then(setSuggestions)
      .catch(() => setSuggestions([]));

    return () => setSuggestions(null);
  }, [open, item.product?.category_id, item.product?.id, item.price_at_time]);

  const loading = suggestions === null && open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Заменить «{item.product?.name ?? '—'}»
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-2 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        )}

        {!loading && suggestions?.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Нет похожих товаров в этой категории
          </p>
        )}

        {!loading && suggestions && suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{s.price.toLocaleString('ru')} ₽ / {s.unit}</span>
                    <PriceDelta original={item.price_at_time} current={s.price} />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onSelect(s)}>
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

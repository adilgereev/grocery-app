import { useState } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteCategory, updateCategorySortOrders } from '@/lib/adminApi';
import type { Category } from '@/types';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeleted: (id: string) => void;
  onReordered: (categories: Category[]) => void;
}

export function CategoriesTable({ categories, onEdit, onDeleted, onReordered }: CategoriesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Находим имя родительской категории
  function getParentName(parentId: string | null): string {
    if (!parentId) return '—';
    return categories.find(c => c.id === parentId)?.name ?? '—';
  }

  // Сдвиг категории вверх/вниз (Shift-метод)
  async function handleMove(category: Category, direction: 'up' | 'down') {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex(c => c.id === category.id);

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const updates = [
      { id: sorted[index].id, sort_order: sorted[swapIndex].sort_order },
      { id: sorted[swapIndex].id, sort_order: sorted[index].sort_order },
    ];

    try {
      await updateCategorySortOrders(updates);
      const newList = [...categories];
      const a = newList.find(c => c.id === sorted[index].id)!;
      const b = newList.find(c => c.id === sorted[swapIndex].id)!;
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      onReordered([...newList].sort((x, y) => x.sort_order - y.sort_order));
    } catch {
      toast.error('Ошибка обновления порядка');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    // Собираем все дочерние id
    const allRelatedIds = [
      deleteTarget.id,
      ...categories.filter(c => c.parent_id === deleteTarget.id).map(c => c.id),
    ];
    try {
      await deleteCategory(deleteTarget.id, allRelatedIds);
      onDeleted(deleteTarget.id);
      toast.success('Категория удалена');
    } catch {
      toast.error('Ошибка удаления');
    } finally {
      setDeleteTarget(null);
    }
  }

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Родительская</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead className="w-32">Порядок</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Категории не найдены
                </TableCell>
              </TableRow>
            ) : sorted.map((cat, index) => (
              <TableRow key={cat.id}>
                {/* Изображение */}
                <TableCell>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-muted" />
                  )}
                </TableCell>
                {/* Название */}
                <TableCell className="font-medium">
                  {cat.parent_id ? <span className="mr-1 text-muted-foreground">—</span> : null}
                  {cat.name}
                </TableCell>
                {/* Slug */}
                <TableCell className="text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                {/* Родительская */}
                <TableCell className="text-sm text-muted-foreground">{getParentName(cat.parent_id)}</TableCell>
                {/* Sort order */}
                <TableCell className="text-sm">{cat.sort_order}</TableCell>
                {/* Тип */}
                <TableCell>
                  <Badge variant={cat.parent_id ? 'secondary' : 'outline'}>
                    {cat.parent_id ? 'Подкатегория' : 'Корневая'}
                  </Badge>
                </TableCell>
                {/* Кнопки сортировки */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMove(cat, 'up')}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === sorted.length - 1}
                      onClick={() => handleMove(cat, 'down')}
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </TableCell>
                {/* Действия */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(cat)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">{categories.length} категорий</div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Удалить категорию?"
        description={`«${deleteTarget?.name}» будет удалена. Все товары в ней будут откреплены.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

import { useState } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteCategory, updateCategorySortOrders, updateCategory } from '@/lib/adminApi';
import type { Category } from '@/types';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeleted: (id: string) => void;
  onReordered: (categories: Category[]) => void;
}

export function CategoriesTable({ categories, onEdit, onDeleted, onReordered }: CategoriesTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Корневые категории, отсортированные по sort_order
  const rootCategories = [...categories]
    .filter(c => c.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Подкатегории, отсортированные по sort_order
  function getSubcategories(parentId: string): Category[] {
    return [...categories]
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  // Сдвиг категории вверх/вниз среди категорий того же уровня
  async function handleMove(category: Category, direction: 'up' | 'down') {
    const siblings = category.parent_id === null
      ? rootCategories
      : getSubcategories(category.parent_id);

    const index = siblings.findIndex(c => c.id === category.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;

    const updates = [
      { id: siblings[index].id, sort_order: siblings[swapIndex].sort_order },
      { id: siblings[swapIndex].id, sort_order: siblings[index].sort_order },
    ];

    try {
      await updateCategorySortOrders(updates);
      const newList = [...categories];
      const a = newList.find(c => c.id === siblings[index].id)!;
      const b = newList.find(c => c.id === siblings[swapIndex].id)!;
      const tmp = a.sort_order;
      a.sort_order = b.sort_order;
      b.sort_order = tmp;
      onReordered([...newList]);
    } catch {
      toast.error('Ошибка обновления порядка');
    }
  }

  // Инлайн-тогл активности
  async function handleToggleActive(category: Category) {
    setTogglingId(category.id);
    try {
      await updateCategory(category.id, { is_active: !category.is_active });
      const newList = categories.map(c =>
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      );
      onReordered(newList);
    } catch {
      toast.error('Ошибка изменения статуса');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
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

  // Строка таблицы для одной категории
  function renderRow(cat: Category, siblings: Category[], isSubcategory: boolean) {
    const index = siblings.findIndex(c => c.id === cat.id);
    return (
      <TableRow
        key={cat.id}
        className={!cat.is_active ? 'opacity-50' : undefined}
      >
        {/* Изображение */}
        <TableCell>
          {cat.image_url ? (
            <img src={cat.image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted" />
          )}
        </TableCell>

        {/* Название с отступом для подкатегорий */}
        <TableCell className="font-medium">
          {isSubcategory ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ChevronRight size={14} className="shrink-0 text-muted-foreground/50" />
              {cat.name}
            </span>
          ) : (
            <span className="font-semibold">{cat.name}</span>
          )}
        </TableCell>

        {/* Slug */}
        <TableCell className="font-mono text-sm text-muted-foreground">{cat.slug}</TableCell>

        {/* Активность — инлайн тогл */}
        <TableCell>
          <Switch
            checked={cat.is_active}
            onCheckedChange={() => handleToggleActive(cat)}
            disabled={togglingId === cat.id}
          />
        </TableCell>

        {/* Кнопки сортировки — только среди одного уровня */}
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
              disabled={index === siblings.length - 1}
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
    );
  }

  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.is_active).length;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-28">Активна</TableHead>
              <TableHead className="w-28">Порядок</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rootCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Категории не найдены
                </TableCell>
              </TableRow>
            ) : rootCategories.map(root => {
              const subs = getSubcategories(root.id);
              return (
                <>
                  {renderRow(root, rootCategories, false)}
                  {subs.map(sub => renderRow(sub, subs, true))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {totalCount} категорий · {activeCount} активных
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Удалить категорию?"
        description={
          deleteTarget?.parent_id === null
            ? `«${deleteTarget?.name}» и все её подкатегории будут удалены. Товары в них открепятся.`
            : `«${deleteTarget?.name}» будет удалена. Товары в ней открепятся.`
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}

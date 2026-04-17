import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { deleteCategory, updateCategorySortOrders, updateCategory } from '@/lib/adminApi';
import type { Category } from '@/types';
import { CategoryRow } from './CategoryRow';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDeleted: (id: string) => void;
  onReordered: (categories: Category[]) => void;
}

/**
 * Таблица категорий в админ-панели.
 * Декомпозирована: отрисовка строки вынесена в CategoryRow.
 */
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
                <React.Fragment key={root.id}>
                  <CategoryRow
                    category={root}
                    index={rootCategories.findIndex(c => c.id === root.id)}
                    siblingsCount={rootCategories.length}
                    isSubcategory={false}
                    isToggling={togglingId === root.id}
                    onToggleActive={handleToggleActive}
                    onMove={handleMove}
                    onEdit={onEdit}
                    onDelete={setDeleteTarget}
                  />
                  {subs.map(sub => (
                    <CategoryRow
                      key={sub.id}
                      category={sub}
                      index={subs.findIndex(c => c.id === sub.id)}
                      siblingsCount={subs.length}
                      isSubcategory={true}
                      isToggling={togglingId === sub.id}
                      onToggleActive={handleToggleActive}
                      onMove={handleMove}
                      onEdit={onEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </React.Fragment>
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

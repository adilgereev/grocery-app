import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CategoriesTable } from '@/features/categories/CategoriesTable';
import { CategoryFormModal } from '@/features/categories/CategoryFormModal';
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
} from '@/lib/adminApi';
import type { CategoryFormValues } from '@/features/categories/categorySchema';
import type { Category } from '@/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cats = await fetchAllCategories();
      setCategories(cats);
    } catch {
      toast.error('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleAddClick() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function handleDeleted(id: string) {
    setCategories(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
  }

  function handleReordered(updated: Category[]) {
    setCategories(updated);
  }

  async function handleSubmit(values: CategoryFormValues) {
    if (editingCategory) {
      await updateCategory(editingCategory.id, values);
      toast.success('Категория обновлена');
    } else {
      // Определяем следующий sort_order
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map(c => c.sort_order))
        : -1;
      await createCategory({ ...values, sort_order: values.sort_order ?? maxOrder + 1 });
      toast.success('Категория создана');
    }
    await loadData();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Категории</h2>
          <p className="text-sm text-muted-foreground">{categories.length} категорий</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus size={16} />
          Добавить категорию
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
          onReordered={handleReordered}
        />
      )}

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

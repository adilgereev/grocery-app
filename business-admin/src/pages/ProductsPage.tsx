import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/features/products/ProductsTable';
import { ProductFormModal } from '@/features/products/ProductFormModal';
import {
  fetchAllProductsWithCategory,
  fetchAllCategories,
  createProduct,
  updateProduct,
  fetchProductForEdit,
} from '@/lib/adminApi';
import type { ProductFormValues } from '@/features/products/productSchema';
import type { ProductWithCategory, Category } from '@/types';

export function ProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProductsWithCategory(),
        fetchAllCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleAddClick() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  async function handleEdit(product: ProductWithCategory) {
    const full = await fetchProductForEdit(product.id);
    setEditingProduct(full);
    setModalOpen(true);
  }

  function handleDeleted(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(values: ProductFormValues) {
    const tags = values.tags
      ? values.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      ...values,
      tags: tags.length > 0 ? tags : undefined,
      calories: values.calories ?? null,
      proteins: values.proteins ?? null,
      fats: values.fats ?? null,
      carbohydrates: values.carbohydrates ?? null,
      image_url: values.image_url ?? undefined,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
      toast.success('Товар обновлён');
    } else {
      await createProduct(payload);
      toast.success('Товар создан');
    }
    await loadData();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Товары</h2>
          <p className="text-sm text-muted-foreground">{products.length} позиций</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus size={16} />
          Добавить товар
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <ProductsTable
          products={products}
          categories={categories}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
        />
      )}

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editingProduct}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

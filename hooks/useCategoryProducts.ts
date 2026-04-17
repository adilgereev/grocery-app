import { useCallback, useEffect, useState } from 'react';
import { fetchProductsByCategoryId } from '@/lib/api/productsApi';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/utils/logger';
import { Product } from '@/types';

export function useCategoryProducts(categoryId: string | string[] | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsByCategoryId(id);
      setProducts(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить товары';
      logger.error('Ошибка загрузки товаров:', err);
      setError(errorMessage);
      useToastStore.getState().showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchProducts(categoryId as string);
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [categoryId, fetchProducts]);

  return { products, loading, error, fetchProducts };
}

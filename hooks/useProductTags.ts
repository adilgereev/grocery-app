import { useState, useMemo } from 'react';
import { Product } from '@/types';

export function useProductTags(products: Product[]) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const uniqueTags = useMemo(() => {
    const allTags = products.flatMap((p) => p.tags || []);
    return Array.from(new Set(allTags));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeTag) return products;
    return products.filter((p) => p.tags?.includes(activeTag));
  }, [products, activeTag]);

  return { uniqueTags, activeTag, setActiveTag, filteredProducts };
}

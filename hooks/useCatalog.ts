import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, LayoutAnimation } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchAllProductsWithCategory, fetchAllCategories, deleteProduct, updateProduct } from '@/lib/api/adminApi';
import { buildHierarchy, CatalogItem, RootHeaderItem, SubHeaderItem, ProductItem } from '@/lib/utils/catalogHierarchy';
import { Category } from '@/types';

export function useCatalog() {
  const router = useRouter();
  const [allItems, setAllItems] = useState<CatalogItem[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [collapsedRoots, setCollapsedRoots] = useState<Set<string>>(new Set());
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProductsWithCategory(),
        fetchAllCategories(),
      ]);
      setCategoriesState(cats);
      setAllItems(buildHierarchy(prods, cats));
    } catch {
      // Ошибка загрузки
    }
    setLoading(false);
  };

  const filteredItems = useMemo((): CatalogItem[] => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase();
    const result: CatalogItem[] = [];
    let currentRoot: RootHeaderItem | null = null;
    let currentSub: SubHeaderItem | null = null;
    let rootAdded = false;
    let subAdded = false;

    for (const item of allItems) {
      if (item.type === 'root_header') {
        currentRoot = item;
        currentSub = null;
        rootAdded = false;
        subAdded = false;
      } else if (item.type === 'sub_header') {
        currentSub = item;
        subAdded = false;
      } else {
        if (item.product.name.toLowerCase().includes(lower)) {
          if (currentRoot && !rootAdded) {
            result.push(currentRoot);
            rootAdded = true;
          }
          if (currentSub && !subAdded) {
            result.push(currentSub);
            subAdded = true;
          }
          result.push(item);
        }
      }
    }
    return result;
  }, [allItems, query]);

  const visibleItems = useMemo(() => {
    const result: CatalogItem[] = [];
    let rootCollapsed = false;
    let subCollapsed = false;
    for (const item of filteredItems) {
      if (item.type === 'root_header') {
        rootCollapsed = collapsedRoots.has(item.id);
        subCollapsed = false;
        result.push(item);
      } else if (item.type === 'sub_header') {
        if (rootCollapsed) continue;
        subCollapsed = collapsedSubs.has(item.id);
        result.push(item);
      } else if (!rootCollapsed && !subCollapsed) {
        result.push(item);
      }
    }
    return result;
  }, [filteredItems, collapsedRoots, collapsedSubs]);

  const handleToggleSub = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const handleToggleRoot = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedRoots(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    router.push({ pathname: '/(admin)/edit-product', params: { id } });
  }, [router]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert(
      'Удаление товара',
      `Вы уверены, что хотите безвозвратно удалить "${name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              setAllItems(prev => {
                const prods = prev
                  .filter((i): i is ProductItem => i.type === 'product')
                  .map(i => i.product)
                  .filter(p => p.id !== id);
                return buildHierarchy(prods, categories);
              });
            } catch (error: unknown) {
              const code = (error as { code?: string })?.code;
              if (code === '23503') {
                Alert.alert('Нельзя удалить', 'Товар присутствует в заказах. Сначала деактивируйте его.');
              } else {
                const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
                Alert.alert('Ошибка', msg);
              }
            }
          },
        },
      ],
    );
  }, [categories]);

  const handleToggleActive = useCallback(async (id: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const rebuildWith = (isActive: boolean) => setAllItems(prev => {
      const prods = prev
        .filter((i): i is ProductItem => i.type === 'product')
        .map(i => i.product)
        .map(p => p.id === id ? { ...p, is_active: isActive } : p);
      return buildHierarchy(prods, categories);
    });

    rebuildWith(newValue);
    try {
      await updateProduct(id, { is_active: newValue });
    } catch {
      rebuildWith(currentValue);
      Alert.alert('Ошибка', 'Не удалось изменить видимость товара');
    }
  }, [categories]);

  return {
    allItems,
    categories,
    loading,
    query,
    setQuery,
    collapsedRoots,
    collapsedSubs,
    visibleItems,
    handleToggleSub,
    handleToggleRoot,
    handleEdit,
    handleDelete,
    handleToggleActive,
  };
}

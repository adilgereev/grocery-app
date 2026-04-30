import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { fetchAllCategories } from '@/lib/api/adminApi';
import { Category } from '@/types';
import { sortHierarchically } from './categories/utils';
import { useCategoryMutations } from './categories/useCategoryMutations';

interface UseCategoriesReturn {
  loading: boolean;
  categories: Category[];
  visibleCategories: Category[];
  rootCategories: Category[];
  collapsedParents: Set<string>;
  modalVisible: boolean;
  editingCategory: Category | null;
  submitting: boolean;
  fetchCategories: () => Promise<void>;
  handleMove: (category: Category, direction: 'up' | 'down') => Promise<void>;
  handleToggleVisibility: (category: Category) => Promise<void>;
  handleToggleCollapse: (id: string) => void;
  handleEdit: (category: Category) => void;
  handleAdd: () => void;
  handleModalSubmit: (data: Partial<Category>) => Promise<void>;
  handleModalClose: () => void;
  handleDeleteItem: (id: string, catName: string) => void;
}

/**
 * Основной хук для управления категориями в мобильном приложении (админка).
 * Декомпозирован: логика мутаций в useCategoryMutations, утилиты в utils.ts.
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  const fetchCategoriesInternal = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const allCategories = await fetchAllCategories();
      setCategories(sortHierarchically(allCategories));
    } catch {
      // Ошибка загрузки категорий
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategoriesInternal(true);
    }, [fetchCategoriesInternal])
  );

  const fetchCategories = useCallback(async () => {
    await fetchCategoriesInternal(false);
  }, [fetchCategoriesInternal]);

  const {
    submitting,
    handleMove,
    handleToggleVisibility,
    handleModalSubmit,
    handleDeleteItem,
  } = useCategoryMutations({
    categories,
    setCategories,
    refreshData: fetchCategoriesInternal,
    onSuccess: () => setModalVisible(false),
  });

  const handleToggleCollapse = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter(c => !c.parent_id || !collapsedParents.has(c.parent_id)),
    [categories, collapsedParents]
  );

  const rootCategories = useMemo(
    () => categories.filter(c => !c.parent_id),
    [categories]
  );

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingCategory(null);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const wrappedModalSubmit = useCallback(
    async (data: Partial<Category>) => {
      await handleModalSubmit(data, editingCategory?.id);
    },
    [handleModalSubmit, editingCategory]
  );

  return {
    loading,
    categories,
    visibleCategories,
    rootCategories,
    collapsedParents,
    modalVisible,
    editingCategory,
    submitting,
    fetchCategories,
    handleMove,
    handleToggleVisibility,
    handleToggleCollapse,
    handleEdit,
    handleAdd,
    handleModalSubmit: wrappedModalSubmit,
    handleModalClose,
    handleDeleteItem,
  };
}

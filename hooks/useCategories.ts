import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySortOrders,
} from '@/lib/api/adminApi';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface UseCategoriesReturn {
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

// Чистая функция для иерархической сортировки
function sortHierarchically(allCategories: Category[]): Category[] {
  const roots = allCategories.filter((c) => !c.parent_id);
  const sorted: Category[] = [];
  const usedIds = new Set<string>();

  roots.forEach((parent) => {
    sorted.push(parent);
    usedIds.add(parent.id);
    const children = allCategories.filter((c) => c.parent_id === parent.id);
    children.forEach((child) => {
      sorted.push(child);
      usedIds.add(child.id);
    });
  });

  const orphans = allCategories.filter((c) => !usedIds.has(c.id));
  sorted.push(...orphans);
  return sorted;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  const fetchCategoriesInternal = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const allCategories = await fetchAllCategories();
      const sorted = sortHierarchically(allCategories);
      setCategories(sorted);
    } catch {
      // Ошибка загрузки категорий
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategoriesInternal(true);
    }, [fetchCategoriesInternal])
  );

  // Публичная версия для onRefresh (non-silent)
  const fetchCategories = useCallback(async () => {
    await fetchCategoriesInternal(false);
  }, [fetchCategoriesInternal]);

  const handleMove = useCallback(
    async (category: Category, direction: 'up' | 'down') => {
      const siblings = categories
        .filter(c => c.parent_id === category.parent_id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const currentIndex = siblings.findIndex(c => c.id === category.id);

      let targetIndex = -1;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < siblings.length - 1) {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex !== -1) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        const newSiblings = [...siblings];
        const temp = newSiblings[currentIndex];
        newSiblings[currentIndex] = newSiblings[targetIndex];
        newSiblings[targetIndex] = temp;

        const updates = newSiblings.map((sibling, index) => ({
          id: sibling.id,
          sort_order: index + 1,
        }));

        const updatesMap = new Map(updates.map(u => [u.id, u.sort_order]));

        const newCategories = categories.map(c =>
          updatesMap.has(c.id) ? { ...c, sort_order: updatesMap.get(c.id)! } : c
        );

        const finalSorted = sortHierarchically(newCategories);
        setCategories(finalSorted);

        try {
          await updateCategorySortOrders(updates);
          useCategoryStore.getState().invalidateCache();
        } catch {
          Alert.alert('Ошибка', 'Не удалось сохранить порядок. Пожалуйста, потяните вниз для обновления.');
          await fetchCategoriesInternal(false);
        }
      }
    },
    [categories, fetchCategoriesInternal]
  );

  const handleToggleVisibility = useCallback(
    async (category: Category) => {
      const newValue = !category.is_active;
      setCategories(prev =>
        prev.map(c => c.id === category.id ? { ...c, is_active: newValue } : c)
      );
      try {
        await updateCategory(category.id, { is_active: newValue });
        useCategoryStore.getState().invalidateCache();
      } catch {
        setCategories(prev =>
          prev.map(c => c.id === category.id ? { ...c, is_active: !newValue } : c)
        );
        Alert.alert('Ошибка', 'Не удалось изменить видимость категории');
      }
    },
    [categories]
  );

  const handleToggleCollapse = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedParents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  const handleModalSubmit = useCallback(
    async (data: Partial<Category>) => {
      setSubmitting(true);

      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, data);
        } else {
          const sameLevel = categories.filter(c => c.parent_id === (data.parent_id || null));
          let sortOrder = 1;
          if (sameLevel.length > 0) {
            const maxOrder = Math.max(...sameLevel.map(c => c.sort_order || 0));
            sortOrder = maxOrder + 1;
          }

          await createCategory({
            name: data.name!,
            slug: data.slug!,
            image_url: data.image_url,
            parent_id: data.parent_id,
            sort_order: sortOrder,
          });
        }

        await fetchCategoriesInternal(true);
        useCategoryStore.getState().invalidateCache();
        setModalVisible(false);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Не удалось сохранить категорию';
        Alert.alert('Ошибка', msg);
      } finally {
        setSubmitting(false);
      }
    },
    [categories, editingCategory, fetchCategoriesInternal]
  );

  const handleDeleteItem = useCallback(
    (id: string, catName: string) => {
      const hasSubcategories = categories.some(c => c.parent_id === id);

      Alert.alert(
        'Удаление категории',
        hasSubcategories
          ? `Вы точно хотите удалить категорию "${catName}"?\n\n⚠️ Все подкатегории и товары в ней будут удалены каскадно!`
          : `Вы точно хотите удалить категорию "${catName}"? Все товары в ней останутся без категории.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                const allIds = [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
                await deleteCategory(id, allIds);

                await fetchCategoriesInternal(true);
                useCategoryStore.getState().invalidateCache();
              } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : 'Не удалось удалить категорию';
                Alert.alert('Ошибка', msg);
              }
            },
          },
        ]
      );
    },
    [categories, fetchCategoriesInternal]
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
    handleModalSubmit,
    handleModalClose,
    handleDeleteItem,
  };
}

import { useCallback, useState } from 'react';
import { Alert, LayoutAnimation } from 'react-native';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategorySortOrders,
} from '@/lib/api/adminApi';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';
import { sortHierarchically } from './utils';

interface UseCategoryMutationsProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  refreshData: (silent?: boolean) => Promise<void>;
  onSuccess?: () => void;
}

/**
 * Хук для операций изменения категорий (создание, удаление, перемещение).
 */
export function useCategoryMutations({
  categories,
  setCategories,
  refreshData,
  onSuccess,
}: UseCategoryMutationsProps) {
  const [submitting, setSubmitting] = useState(false);

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

        setCategories(sortHierarchically(newCategories));

        try {
          await updateCategorySortOrders(updates);
          useCategoryStore.getState().invalidateCache();
        } catch {
          Alert.alert('Ошибка', 'Не удалось сохранить порядок. Пожалуйста, обновите список.');
          await refreshData(false);
        }
      }
    },
    [categories, refreshData, setCategories]
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
    [setCategories]
  );

  const handleModalSubmit = useCallback(
    async (data: Partial<Category>, editingId?: string) => {
      setSubmitting(true);
      try {
        if (editingId) {
          await updateCategory(editingId, data);
        } else {
          const sameLevel = categories.filter(c => c.parent_id === (data.parent_id || null));
          const maxOrder = Math.max(0, ...sameLevel.map(c => c.sort_order || 0));
          
          await createCategory({
            name: data.name!,
            slug: data.slug!,
            image_url: data.image_url,
            parent_id: data.parent_id,
            sort_order: maxOrder + 1,
          });
        }

        await refreshData(true);
        useCategoryStore.getState().invalidateCache();
        onSuccess?.();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Не удалось сохранить категорию';
        Alert.alert('Ошибка', msg);
      } finally {
        setSubmitting(false);
      }
    },
    [categories, refreshData, onSuccess]
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
                await refreshData(true);
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
    [categories, refreshData]
  );

  return {
    submitting,
    handleMove,
    handleToggleVisibility,
    handleModalSubmit,
    handleDeleteItem,
  };
}

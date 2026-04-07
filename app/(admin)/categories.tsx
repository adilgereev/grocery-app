import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import CategoryFormModal from '@/components/admin/CategoryFormModal';
import CategoryItem from '@/components/admin/CategoryItem';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fetchAllCategories, createCategory, updateCategory, deleteCategory, updateCategorySortOrders } from '@/lib/api/adminApi';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCategories(true);
    }, [])
  );

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const allCategories = await fetchAllCategories();
      // Иерархическая сортировка: Родитель (по sort_order) -> Дети (по sort_order)
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
      setCategories(sorted);
    } catch {
      // Ошибка загрузки категорий
    }
    setLoading(false);
  };

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
    // Находим всех сиблингов (тот же уровень иерархии) и сортируем по sort_order
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
      // 1. Оптимистичное обновление локального стейта
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // Меняем элементы местами в массиве сиблингов
      const newSiblings = [...siblings];
      const temp = newSiblings[currentIndex];
      newSiblings[currentIndex] = newSiblings[targetIndex];
      newSiblings[targetIndex] = temp;
      
      // Переназначаем sort_order всем сиблингам (Shift метод)
      const updates = newSiblings.map((sibling, index) => ({
        id: sibling.id,
        sort_order: index + 1 // Нормализуем индексы 1, 2, 3...
      }));

      const updatesMap = new Map(updates.map(u => [u.id, u.sort_order]));

      // Пересортировываем локальный стейт, чтобы иерархия не сломалась
      const newCategories = categories.map(c => 
        updatesMap.has(c.id) ? { ...c, sort_order: updatesMap.get(c.id)! } : c
      );
      
      const roots = newCategories.filter(c => !c.parent_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const finalSorted: Category[] = [];
      const usedIds = new Set<string>();

      roots.forEach(root => {
        finalSorted.push(root);
        usedIds.add(root.id);
        const children = newCategories
          .filter(c => c.parent_id === root.id)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        children.forEach(child => {
          finalSorted.push(child);
          usedIds.add(child.id);
        });
      });

      // Добавляем остальных (сирот)
      finalSorted.push(...newCategories.filter(c => !usedIds.has(c.id)));

      setCategories(finalSorted);

      // 2. Обновление в Supabase в фоне (без лоадера)
      try {
        await updateCategorySortOrders(updates);
        
        // Инвалидируем кеш беззвучно
        useCategoryStore.getState().invalidateCache();
      } catch {
        Alert.alert('Ошибка', 'Не удалось сохранить порядок. Пожалуйста, потяните вниз для обновления.');
        await fetchCategories();
      }
    }
  };

  // swapSortOrders больше не нужен как отдельная async функция ожидания

  // Получить только корневые категории (для выбора родителя)
  const rootCategories = categories.filter(c => !c.parent_id);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleModalSubmit = async (data: Partial<Category>) => {
    setSubmitting(true);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        // Для новых категорий вычисляем максимальный sort_order + 1 (добавление в конец)
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
          sort_order: sortOrder
        });
      }

      await fetchCategories(true);
      useCategoryStore.getState().invalidateCache();
      setModalVisible(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Не удалось сохранить категорию';
      Alert.alert('Ошибка', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id: string, catName: string) => {
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

              await fetchCategories(true);
              useCategoryStore.getState().invalidateCache();
            } catch (error: unknown) {
              const msg = error instanceof Error ? error.message : 'Не удалось удалить категорию';
              Alert.alert('Ошибка', msg);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Все категории ({categories.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} testID="add-category-btn">
          <Ionicons name="add" size={24} color={Colors.light.card} />
          <Text style={styles.addBtnText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryItem
            item={item}
            parentCategory={categories.find(c => c.id === item.parent_id)}
            onMove={handleMove}
            onEdit={handleEdit}
            onDelete={handleDeleteItem}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchCategories}
        ListEmptyComponent={<Text style={styles.empty}>Категории не найдены</Text>}
      />

      <CategoryFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        rootCategories={rootCategories}
        isSubmitting={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.m, backgroundColor: Colors.light.card, borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.m,
  },
  addBtnText: { color: Colors.light.card, fontWeight: '700', marginLeft: 4, fontSize: 14 },
  list: { padding: Spacing.m },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },
});

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CategoryFormModal from '@/components/admin/CategoryFormModal';
import CategoryItem from '@/components/admin/CategoryItem';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { fetchAllCategories, createCategory, updateCategory, deleteCategory, updateCategorySortOrders } from '@/lib/api/adminApi';
import { useCategoryStore } from '@/store/categoryStore';
import { Category } from '@/types';

export default function CategoriesScreenWeb() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
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
      const newSiblings = [...siblings];
      const temp = newSiblings[currentIndex];
      newSiblings[currentIndex] = newSiblings[targetIndex];
      newSiblings[targetIndex] = temp;
      
      const updates = newSiblings.map((sibling, index) => ({
        id: sibling.id,
        sort_order: index + 1
      }));

      const updatesMap = new Map(updates.map(u => [u.id, u.sort_order]));
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

      finalSorted.push(...newCategories.filter(c => !usedIds.has(c.id)));
      setCategories(finalSorted);

      try {
        await updateCategorySortOrders(updates);
        useCategoryStore.getState().invalidateCache();
      } catch {
        alert('Не удалось изменить порядок');
        await fetchCategories();
      }
    }
  };

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
      alert(error instanceof Error ? error.message : 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id: string, catName: string) => {
    if (window.confirm(`Вы точно хотите удалить категорию "${catName}"?`)) {
      (async () => {
        try {
          const allIds = [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
          await deleteCategory(id, allIds);
          await fetchCategories(true);
          useCategoryStore.getState().invalidateCache();
        } catch {
          alert('Ошибка удаления');
        }
      })();
    }
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
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="add" size={24} color={Colors.light.white} />
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
        onRefresh={fetchCategories}
        refreshing={loading}
      />

      <CategoryFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        rootCategories={categories.filter(c => !c.parent_id)}
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
  addBtnText: { color: Colors.light.white, fontWeight: '700', marginLeft: 4, fontSize: 14 },
  list: { padding: Spacing.m },
});

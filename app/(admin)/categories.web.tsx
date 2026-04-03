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
import { supabase } from '@/lib/supabase';
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
      fetchCategories();
    }, [])
  );

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        const allCategories = data as Category[];
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
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
    const siblings = categories.filter(c => c.parent_id === category.parent_id);
    const currentIndex = siblings.findIndex(c => c.id === category.id);

    let targetIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex !== -1) {
      const targetCategory = siblings[targetIndex];
      try {
        await supabase.from('categories').update({ sort_order: targetCategory.sort_order }).eq('id', category.id);
        await supabase.from('categories').update({ sort_order: category.sort_order }).eq('id', targetCategory.id);
        
        useCategoryStore.getState().invalidateCache();
        await fetchCategories(true);
      } catch {
        alert('Не удалось изменить порядок');
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
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const sameLevel = categories.filter(c => c.parent_id === (data.parent_id || null));
        let sortOrder = 0;
        if (sameLevel.length > 0) {
          const minOrder = Math.min(...sameLevel.map(c => c.sort_order));
          sortOrder = minOrder - 1;
        }

        const { error } = await supabase
          .from('categories')
          .insert({
            name: data.name!,
            slug: data.slug!,
            image_url: data.image_url,
            parent_id: data.parent_id,
            sort_order: sortOrder
          });
        if (error) throw error;
      }
      await fetchCategories(true);
      useCategoryStore.getState().invalidateCache();
      setModalVisible(false);
    } catch (error: any) {
      alert(error.message || 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = (id: string, catName: string) => {
    if (window.confirm(`Вы точно хотите удалить категорию "${catName}"?`)) {
      (async () => {
        try {
          const allIds = [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
          await supabase.from('products').update({ category_id: null }).in('category_id', allIds);
          await supabase.from('categories').delete().eq('id', id);
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
  addBtnText: { color: Colors.light.card, fontWeight: '700', marginLeft: 4, fontSize: 14 },
  list: { padding: Spacing.m },
});

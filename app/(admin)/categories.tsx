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
import { supabase } from '@/lib/supabase';
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
      fetchCategories();
    }, [])
  );

  const fetchCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      const allCategories = data as Category[];
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
    }
    setLoading(false);
  };

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
    // Находим всех сиблингов (тот же уровень иерархии)
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
      
      // 1. Оптимистичное обновление локального стейта
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // Создаем новый массив категорий с переставленными элементами
      const newCategories = [...categories];
      const idx1 = newCategories.findIndex(c => c.id === category.id);
      const idx2 = newCategories.findIndex(c => c.id === targetCategory.id);
      
      // Меняем только sort_order в объектах
      const tempOrder = newCategories[idx1].sort_order;
      newCategories[idx1] = { ...newCategories[idx1], sort_order: newCategories[idx2].sort_order };
      newCategories[idx2] = { ...newCategories[idx2], sort_order: tempOrder };
      
      // Пересортировываем локальный стейт, чтобы иерархия не сломалась
      // Но проще всего просто вызвать пересчет иерархии на основе новых данных
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
      const orphans = newCategories.filter(c => !usedIds.has(c.id));
      finalSorted.push(...orphans);

      setCategories(finalSorted);

      // 2. Обновление в Supabase в фоне (без лоадера)
      try {
        const { error: err1 } = await supabase
          .from('categories')
          .update({ sort_order: targetCategory.sort_order })
          .eq('id', category.id);

        const { error: err2 } = await supabase
          .from('categories')
          .update({ sort_order: category.sort_order })
          .eq('id', targetCategory.id);

        if (err1 || err2) throw new Error('Ошибка БД');
        
        // Инвалидируем кеш беззвучно
        useCategoryStore.getState().invalidateCache();
        // Можно сделать silent fetch, чтобы убедиться в синхронизации
        await fetchCategories(true);
      } catch {
        Alert.alert('Ошибка', 'Не удалось сохранить порядок. Пожалуйста, потяните вниз для обновления.');
        await fetchCategories(); // Полный рефетч для отката
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
        const { error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Для новых категорий вычисляем минимальный sort_order
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
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить категорию');
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
              // Отвязываем товары
              const allIds = [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
              await supabase.from('products').update({ category_id: null }).in('category_id', allIds);

              const { error } = await supabase.from('categories').delete().eq('id', id);
              if (error) throw error;

              await fetchCategories(true);
              useCategoryStore.getState().invalidateCache();
            } catch (error: any) {
              Alert.alert('Ошибка', error.message || 'Не удалось удалить категорию');
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

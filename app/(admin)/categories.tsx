import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryFormModal from '@/components/admin/CategoryFormModal';
import CategoryItem from '@/components/admin/CategoryItem';
import CategoriesSkeleton from '@/components/admin/CategoriesSkeleton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/domain/useCategories';

export default function CategoriesScreen() {
  const {
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
  } = useCategories();

  const addButton = (
    <TouchableOpacity onPress={handleAdd} testID="add-category-btn">
      <Ionicons name="add-circle" size={28} color={Colors.light.primary} />
    </TouchableOpacity>
  );

  if (loading) {
    return <CategoriesSkeleton />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Категории" rightElement={addButton} />
      <FlatList
        data={visibleCategories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryItem
            item={item}
            parentCategory={categories.find(c => c.id === item.parent_id)}
            isCollapsed={!item.parent_id ? collapsedParents.has(item.id) : undefined}
            onToggleCollapse={!item.parent_id ? () => handleToggleCollapse(item.id) : undefined}
            onMove={handleMove}
            onEdit={handleEdit}
            onDelete={handleDeleteItem}
            onToggleVisibility={handleToggleVisibility}
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
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        rootCategories={rootCategories}
        isSubmitting={submitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },
});

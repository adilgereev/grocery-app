import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { CatalogProductCard } from '@/components/admin/CatalogProductCard';
import { CatalogSectionHeader } from '@/components/admin/CatalogSectionHeader';
import { CatalogSkeleton } from '@/components/admin/CatalogSkeleton';
import { CatalogSearchBar } from '@/components/admin/CatalogSearchBar';
import ErrorState from '@/components/ui/ErrorState';
import { useCatalog } from '@/hooks/domain/useCatalog';
import { CatalogItem } from '@/lib/utils/catalogHierarchy';

export default function CatalogScreen() {
  const {
    loading,
    error,
    refetch,
    query,
    setQuery,
    visibleItems,
    collapsedRoots,
    collapsedSubs,
    handleToggleSub,
    handleToggleRoot,
    handleEdit,
    handleDelete,
    handleToggleActive,
  } = useCatalog();

  const renderItem = useCallback(({ item }: { item: CatalogItem }) => {
    if (item.type === 'product') {
      return (
        <CatalogProductCard
          product={item.product}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      );
    }

    const isCollapsed = item.type === 'root_header'
      ? collapsedRoots.has(item.id)
      : collapsedSubs.has(item.id);

    const handleToggle = item.type === 'root_header'
      ? () => handleToggleRoot(item.id)
      : () => handleToggleSub(item.id);

    return (
      <CatalogSectionHeader
        item={item}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />
    );
  }, [
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleToggleRoot,
    handleToggleSub,
    collapsedRoots,
    collapsedSubs,
  ]);

  if (loading) {
    return <CatalogSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Товары" />
      <CatalogSearchBar query={query} onChangeText={setQuery} />
      <FlatList
        data={visibleItems}
        keyExtractor={(item, index) =>
          item.type === 'product' ? item.product.id : `${item.type}-${index}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Товары не найдены</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },
});

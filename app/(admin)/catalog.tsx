import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { fetchAllProductsWithCategory, deleteProduct } from '@/lib/api/adminApi';
import Skeleton from '@/components/ui/Skeleton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SectionList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductWithCategory } from '@/types';

export default function CatalogScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<{ title: string; data: ProductWithCategory[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProductsWithCategory();
      const grouped = data.reduce((acc: Record<string, ProductWithCategory[]>, current: ProductWithCategory) => {
        const catName = current.category?.name || 'Без категории';
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(current);
        return acc;
      }, {});

      const sectionData = Object.keys(grouped).map(key => ({
        title: key,
        data: grouped[key]
      }));
      
      sectionData.sort((a, b) => a.title.localeCompare(b.title));
      setSections(sectionData);
    } catch {
      // Ошибка загрузки товаров
    }
    setLoading(false);
  };

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
              setSections(prevSections => prevSections.map(section => ({
                ...section,
                data: section.data.filter((p) => p.id !== id)
              })).filter(section => section.data.length > 0));
            } catch (error: unknown) {
              const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
              Alert.alert('Ошибка', msg);
            }
          }
        }
      ]
    );
  }, []);

  const renderProduct = useCallback(({ item }: { item: ProductWithCategory }) => (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url || '' }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.category}>{item.category?.name || 'Без категории'}</Text>
          <Text style={styles.price}>{item.price} ₽ {item.unit ? `/ ${item.unit}` : ''}</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item.id)}>
          <Ionicons name="pencil" size={18} color={Colors.light.primary} />
          <Text style={styles.editText}>Изменить</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons name="trash" size={18} color={Colors.light.error} />
          <Text style={styles.deleteText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleEdit, handleDelete]);

  const renderSectionHeader = useCallback(({ section: { title, data } }: { section: { title: string; data: ProductWithCategory[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{data.length}</Text>
      </View>
    </View>
  ), []);

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <ScreenHeader title="Каталог" />
        <View style={styles.list}>
          {[1, 2, 3].map(section => (
            <View key={section}>
              <Skeleton width={140} height={24} style={styles.skeletonSectionTitle} />
              {[1, 2, 3].map(item => (
                <View key={item} style={[styles.card, styles.skeletonCardRow]}>
                  <Skeleton width={60} height={60} borderRadius={Radius.m} style={styles.skeletonImage} />
                  <View style={styles.skeletonTextContainer}>
                    <Skeleton width="70%" height={15} style={styles.skeletonLine} />
                    <Skeleton width="40%" height={13} style={styles.skeletonLine} />
                    <Skeleton width="30%" height={16} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Каталог" />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Товары не найдены</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m },
  skeletonSectionTitle: { marginTop: Spacing.m, marginBottom: Spacing.s },
  skeletonCardRow: { flexDirection: 'row', alignItems: 'center' },
  skeletonImage: { marginRight: Spacing.m },
  skeletonTextContainer: { flex: 1 },
  skeletonLine: { marginBottom: 6 },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  image: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m },
  textContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  category: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: Colors.light.primary },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.s },
  editText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.primary },
  deleteText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.error },
  placeholderImage: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m, backgroundColor: Colors.light.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: Spacing.s, paddingTop: Spacing.m },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  sectionBadge: { backgroundColor: Colors.light.border, borderRadius: Radius.m, paddingHorizontal: 8, paddingVertical: 2, marginLeft: Spacing.s },
  sectionBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.light.textSecondary },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 }
});

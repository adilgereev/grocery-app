import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { fetchAllProductsWithCategory, fetchAllCategories, deleteProduct, updateProduct } from '@/lib/api/adminApi';
import Skeleton from '@/components/ui/Skeleton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, ProductWithCategory } from '@/types';

// Включаем LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Типы для плоского иерархического списка ────────────────────────────────

type RootHeaderItem = { type: 'root_header'; id: string; title: string; count: number };
type SubHeaderItem  = { type: 'sub_header'; id: string; title: string; count: number };
type ProductItem    = { type: 'product'; product: ProductWithCategory };
type CatalogItem    = RootHeaderItem | SubHeaderItem | ProductItem;

/**
 * Строит плоский иерархический список:
 * root_header → [product…] → sub_header → [product…] → …
 */
function buildHierarchy(
  products: ProductWithCategory[],
  categories: Category[],
): CatalogItem[] {
  const roots = categories
    .filter(c => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const items: CatalogItem[] = [];
  const usedIds = new Set<string>();

  roots.forEach(root => {
    const directProducts = products.filter(p => p.category_id === root.id);
    const subcategories = categories
      .filter(c => c.parent_id === root.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const subProducts = subcategories.flatMap(sub =>
      products.filter(p => p.category_id === sub.id)
    );

    const totalCount = directProducts.length + subProducts.length;
    if (totalCount === 0) return;

    items.push({ type: 'root_header', id: root.id, title: root.name, count: totalCount });

    directProducts.forEach(p => {
      items.push({ type: 'product', product: p });
      usedIds.add(p.id);
    });

    subcategories.forEach(sub => {
      const prods = products.filter(p => p.category_id === sub.id);
      if (prods.length === 0) return;
      items.push({ type: 'sub_header', id: sub.id, title: sub.name, count: prods.length });
      prods.forEach(p => {
        items.push({ type: 'product', product: p });
        usedIds.add(p.id);
      });
    });
  });

  // Товары без категории или с неизвестной категорией
  const orphans = products.filter(p => !usedIds.has(p.id));
  if (orphans.length > 0) {
    items.push({ type: 'root_header', id: '__none__', title: 'Без категории', count: orphans.length });
    orphans.forEach(p => items.push({ type: 'product', product: p }));
  }

  return items;
}

export default function CatalogScreen() {
  const router = useRouter();
  const [allItems, setAllItems] = useState<CatalogItem[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [collapsedRoots, setCollapsedRoots] = useState<Set<string>>(new Set());
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchAllProductsWithCategory(),
        fetchAllCategories(),
      ]);
      setCategoriesState(cats);
      setAllItems(buildHierarchy(prods, cats));
    } catch {
      // Ошибка загрузки
    }
    setLoading(false);
  };

  // Фильтрация с сохранением заголовков над найденными товарами
  const filteredItems = useMemo((): CatalogItem[] => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase();
    const result: CatalogItem[] = [];
    let currentRoot: RootHeaderItem | null = null;
    let currentSub: SubHeaderItem | null = null;
    let rootAdded = false;
    let subAdded = false;

    for (const item of allItems) {
      if (item.type === 'root_header') {
        currentRoot = item;
        currentSub = null;
        rootAdded = false;
        subAdded = false;
      } else if (item.type === 'sub_header') {
        currentSub = item;
        subAdded = false;
      } else {
        if (item.product.name.toLowerCase().includes(lower)) {
          if (currentRoot && !rootAdded) {
            result.push(currentRoot);
            rootAdded = true;
          }
          if (currentSub && !subAdded) {
            result.push(currentSub);
            subAdded = true;
          }
          result.push(item);
        }
      }
    }
    return result;
  }, [allItems, query]);

  const handleToggleSub = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const handleToggleRoot = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedRoots(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

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
              setAllItems(prev => {
                const prods = prev
                  .filter((i): i is ProductItem => i.type === 'product')
                  .map(i => i.product)
                  .filter(p => p.id !== id);
                return buildHierarchy(prods, categories);
              });
            } catch (error: unknown) {
              const code = (error as { code?: string })?.code;
              if (code === '23503') {
                Alert.alert('Нельзя удалить', 'Товар присутствует в заказах. Сначала деактивируйте его.');
              } else {
                const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
                Alert.alert('Ошибка', msg);
              }
            }
          },
        },
      ],
    );
  }, [categories]);

  const handleToggleActive = useCallback(async (id: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const rebuildWith = (isActive: boolean) => setAllItems(prev => {
      const prods = prev
        .filter((i): i is ProductItem => i.type === 'product')
        .map(i => i.product)
        .map(p => p.id === id ? { ...p, is_active: isActive } : p);
      return buildHierarchy(prods, categories);
    });

    rebuildWith(newValue);
    try {
      await updateProduct(id, { is_active: newValue });
    } catch {
      rebuildWith(currentValue);
      Alert.alert('Ошибка', 'Не удалось изменить видимость товара');
    }
  }, [categories]);

  // Скрываем товары/подзаголовки свёрнутых категорий
  const visibleItems = useMemo(() => {
    const result: CatalogItem[] = [];
    let rootCollapsed = false;
    let subCollapsed = false;
    for (const item of filteredItems) {
      if (item.type === 'root_header') {
        rootCollapsed = collapsedRoots.has(item.id);
        subCollapsed = false;
        result.push(item);
      } else if (item.type === 'sub_header') {
        if (rootCollapsed) continue;
        subCollapsed = collapsedSubs.has(item.id);
        result.push(item);
      } else if (!rootCollapsed && !subCollapsed) {
        result.push(item);
      }
    }
    return result;
  }, [filteredItems, collapsedRoots, collapsedSubs]);

  const renderItem = useCallback(({ item }: { item: CatalogItem }) => {
    if (item.type === 'root_header') {
      const isCollapsed = collapsedRoots.has(item.id);
      return (
        <TouchableOpacity style={styles.rootHeader} onPress={() => handleToggleRoot(item.id)} activeOpacity={0.7}>
          <Text style={styles.rootTitle}>{item.title}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{item.count}</Text>
          </View>
          <Ionicons
            name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
            size={20}
            color={Colors.light.textSecondary}
            style={styles.rootChevron}
          />
        </TouchableOpacity>
      );
    }

    if (item.type === 'sub_header') {
      const isCollapsed = collapsedSubs.has(item.id);
      return (
        <TouchableOpacity style={styles.subHeader} onPress={() => handleToggleSub(item.id)} activeOpacity={0.7}>
          <Ionicons name="return-down-forward" size={16} color={Colors.light.textLight} style={styles.subIcon} />
          <Text style={styles.subTitle}>{item.title}</Text>
          <View style={styles.subBadge}>
            <Text style={styles.subBadgeText}>{item.count}</Text>
          </View>
          <Ionicons
            name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
            size={16}
            color={Colors.light.textLight}
            style={styles.rootChevron}
          />
        </TouchableOpacity>
      );
    }

    const { product } = item;
    return (
      <View style={[styles.card, !product.is_active && styles.inactiveCard]}>
        <View style={styles.infoRow}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.category}>{product.category?.name || 'Без категории'}</Text>
            <Text style={styles.price}>{product.price} ₽ {product.unit ? `/ ${product.unit}` : ''}</Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(product.id)}>
            <Ionicons name="pencil" size={18} color={Colors.light.primary} />
            <Text style={styles.editText}>Изменить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleActive(product.id, product.is_active)}
            testID={`toggle-active-${product.id}`}
          >
            <Ionicons
              name={product.is_active ? 'eye' : 'eye-off'}
              size={18}
              color={product.is_active ? Colors.light.primary : Colors.light.textLight}
            />
            <Text style={[styles.editText, !product.is_active && styles.hiddenText]}>
              {product.is_active ? 'Скрыть' : 'Показать'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(product.id, product.name)}>
            <Ionicons name="trash" size={18} color={Colors.light.error} />
            <Text style={styles.deleteText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [handleEdit, handleDelete, handleToggleActive, handleToggleRoot, handleToggleSub, collapsedRoots, collapsedSubs]);

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <ScreenHeader title="Товары" />
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
      <ScreenHeader title="Товары" />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.light.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск товара..."
          placeholderTextColor={Colors.light.textLight}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          testID="catalog-search-input"
        />
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: Spacing.m,
    marginTop: Spacing.m,
    borderRadius: Radius.l,
    paddingHorizontal: Spacing.m,
    ...Shadows.sm,
  },
  searchIcon: { marginRight: Spacing.s },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: Colors.light.text,
  },
  list: { padding: Spacing.m },
  skeletonSectionTitle: { marginTop: Spacing.m, marginBottom: Spacing.s },
  skeletonCardRow: { flexDirection: 'row', alignItems: 'center' },
  skeletonImage: { marginRight: Spacing.m },
  skeletonTextContainer: { flex: 1 },
  skeletonLine: { marginBottom: 6 },
  // ─── Заголовки ────────────────────────────────────────────────
  rootHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.s,
    paddingTop: Spacing.m,
  },
  rootTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  sectionBadge: {
    backgroundColor: Colors.light.border,
    borderRadius: Radius.m,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: Spacing.s,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.light.textSecondary },
  rootChevron: { marginLeft: 'auto' as const },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    paddingLeft: Spacing.m,
  },
  subIcon: { marginRight: 6 },
  subTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.textSecondary },
  subBadge: {
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.m,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: Spacing.s,
  },
  subBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.light.textLight },
  // ─── Карточка товара ──────────────────────────────────────────
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  inactiveCard: { opacity: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  image: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m },
  textContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  category: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: Colors.light.primary },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.s },
  editText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.primary },
  hiddenText: { color: Colors.light.textLight },
  deleteText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.error },
  placeholderImage: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m, backgroundColor: Colors.light.border },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },
});

import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const { data, error } = await supabase
      .from('products')
      .select('*, category:category_id(name)')
      .order('id', { ascending: false });

    if (!error && data) {
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
    }
    setLoading(false);
  };

  const handleEdit = (id: string) => {
    router.push({ pathname: '/(admin)/edit-product', params: { id } });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Удаление товара',
      `Вы уверены, что хотите безвозвратно удалить "${name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
              Alert.alert('Ошибка', error.message);
            } else {
              setSections(prevSections => prevSections.map(section => ({
                ...section,
                data: section.data.filter((p) => p.id !== id)
              })).filter(section => section.data.length > 0));
            }
          }
        }
      ]
    );
  };

  const renderProduct = ({ item }: { item: ProductWithCategory }) => (
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
  );

  const renderSectionHeader = ({ section: { title, data } }: { section: { title: string; data: ProductWithCategory[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{data.length}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.m },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
  sectionBadge: { backgroundColor: Colors.light.border, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: Spacing.s },
  sectionBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.light.textSecondary },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 }
});

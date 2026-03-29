import { Colors, Radius, Spacing } from '@/constants/theme';
import { uploadImage } from '@/lib/storageUtils';
import { useCategoryStore } from '@/store/categoryStore';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList,
  Image, KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Поля формы
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedParent, setSelectedParent] = useState<string | null>(null); // Выбранная родительская категория
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      // Иерархическая сортировка: Родитель (по sort_order) -> Дети (по sort_order)
      const roots = data.filter((c: any) => !c.parent_id);
      const sorted: any[] = [];
      const usedIds = new Set<string>();

      roots.forEach((parent: any) => {
        sorted.push(parent);
        usedIds.add(parent.id);
        const children = data.filter((c: any) => c.parent_id === parent.id);
        children.forEach((child: any) => {
          sorted.push(child);
          usedIds.add(child.id);
        });
      });

      const orphans = data.filter((c: any) => !usedIds.has(c.id));
      sorted.push(...orphans);
      setCategories(sorted as Category[]);
    }
    setLoading(false);
  };

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
    // Находим соседа на том же уровне
    const siblings = categories.filter(c => c.parent_id === category.parent_id);
    const currentIndex = siblings.findIndex(c => c.id === category.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const prevCategory = siblings[currentIndex - 1];
      await swapSortOrders(category, prevCategory);
    } else if (direction === 'down' && currentIndex < siblings.length - 1) {
      const nextCategory = siblings[currentIndex + 1];
      await swapSortOrders(category, nextCategory);
    }
  };

  const swapSortOrders = async (c1: Category, c2: Category) => {
    const { error: err1 } = await supabase
      .from('categories')
      .update({ sort_order: c2.sort_order })
      .eq('id', c1.id);
    
    const { error: err2 } = await supabase
      .from('categories')
      .update({ sort_order: c1.sort_order })
      .eq('id', c2.id);

    if (!err1 && !err2) {
      await fetchCategories();
      useCategoryStore.getState().invalidateCache();
    }
  };

  // Получить только корневые категории (для выбора родителя)
  const rootCategories = categories.filter(c => !c.parent_id);

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setCurrentId(null);
    setSelectedParent(null);
    setIsEditing(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (category: Category) => {
    setName(category.name);
    setImageUrl(category.image_url || '');
    setCurrentId(category.id);
    setSelectedParent(category.parent_id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setUploading(true);
      try {
        const publicUrl = await uploadImage(result.assets[0].uri, 'categories');
        setImageUrl(publicUrl);
      } catch {
        Alert.alert('Ошибка', 'Не удалось загрузить изображение');
      } finally {
        setUploading(false);
      }
    }
  };

  const slugify = (text: string) => {
    const cyrillicToLatin: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
      'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
      'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return text
      .toLowerCase()
      .split('')
      .map(char => cyrillicToLatin[char] || (/[a-z0-9]/.test(char) ? char : '-'))
      .join('')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название категории');
      return;
    }

    setSubmitting(true);
    const slug = slugify(name);
    
    // Для новых категорий вычисляем минимальный sort_order, чтобы они были в начале
    let sortOrder = 0;
    if (!isEditing) {
      const sameLevel = categories.filter(c => c.parent_id === selectedParent);
      if (sameLevel.length > 0) {
        const minOrder = Math.min(...sameLevel.map(c => c.sort_order));
        sortOrder = minOrder - 1;
      }
    }

    const categoryData = {
      name: name.trim(),
      slug: slug,
      image_url: imageUrl.trim() || null,
      parent_id: selectedParent,
      ...(isEditing ? {} : { sort_order: sortOrder })
    };

    if (isEditing && currentId) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', currentId);

      if (error) {
        Alert.alert('Ошибка обновления', error.message);
      } else {
        // Ре-фетч данных гарантирует правильную иерархию в списке
        await fetchCategories();
        // Сброс кеша, чтобы изменения отразились на главной
        useCategoryStore.getState().invalidateCache();
        setModalVisible(false);
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        Alert.alert('Ошибка создания', error.message);
      } else if (data) {
        await fetchCategories();
        useCategoryStore.getState().invalidateCache();
        setModalVisible(false);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = (id: string, catName: string) => {
    // Проверяем, есть ли подкатегории у этой категории
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
            // Сначала "отвязываем" товары от удаляемых категорий (категории и её подкатегорий)
            // чтобы не нарушить FK constraint через order_items
            const allIds = [id, ...categories.filter(c => c.parent_id === id).map(c => c.id)];
            await supabase.from('products').update({ category_id: null }).in('category_id', allIds);

            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) {
              Alert.alert('Ошибка', error.message);
            } else {
              // Удаляем также все подкатегории (каскадно) из состояния
              const deleteSubcategories = (parentId: string) => {
                const subs = categories.filter(c => c.parent_id === parentId);
                subs.forEach(sub => {
                  deleteSubcategories(sub.id);
                });
                setCategories(prev => prev.filter(c => c.id !== parentId));
              };
              deleteSubcategories(id);
              // Удаляем саму категорию из состояния (уже была удалена выше)
            }
          }
        }
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isHex = item.image_url?.startsWith('#');
    const isSubcategory = !!item.parent_id; // Это подкатегория?

    // Находим родительскую категорию для отображения в иерархии
    const parentCategory = categories.find(c => c.id === item.parent_id);

    return (
      <View style={[styles.card, isSubcategory && styles.subcategoryCard]}>
        <View style={styles.infoRow}>
          {isSubcategory && (
            <React.Fragment>
              <Ionicons name="return-down-forward" size={20} color={Colors.light.textLight} style={{ marginRight: Spacing.s }} />
              {isHex ? (
                <View style={[styles.imagePreview, { backgroundColor: item.image_url || undefined }]} />
              ) : item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.imagePreview} />
              ) : (
                <View style={[styles.imagePreview, { backgroundColor: Colors.light.border }]} />
              )}
            </React.Fragment>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.catName}>{item.name}</Text>
            {isSubcategory && parentCategory && (
              <React.Fragment>
                <Text style={styles.parentBadge}>← {parentCategory.name}</Text>
              </React.Fragment>
            )}
          </View>
          
          <View style={styles.orderActions}>
            <TouchableOpacity 
              style={styles.orderBtn} 
              onPress={() => handleMove(item, 'up')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-up" size={22} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.orderBtn} 
              onPress={() => handleMove(item, 'down')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={22} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEdit(item)}>
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
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Ionicons name="add" size={24} color={Colors.light.card} />
          <Text style={styles.addBtnText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchCategories}
        ListEmptyComponent={<Text style={styles.empty}>Категории не найдены</Text>}
      />

      {/* Модалка для добавления/редактирования */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Редактировать категорию' : 'Новая категория'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Родительская категория</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => {
                    // Простой selector - показываем alert с выбором родителя
                    // Исключаем текущую категорию, чтобы избежать цикличности
                    const otherRoots = rootCategories.filter(c => c.id !== currentId);
                    const options = [
                      { title: 'Без родителя (корневая категория)', value: null },
                      ...otherRoots.map(c => ({ title: c.name, value: c.id }))
                    ];
                    Alert.alert(
                      'Выберите родительскую категорию',
                      '',
                      options.map((opt, index) => ({
                        text: opt.title,
                        onPress: () => setSelectedParent(opt.value)
                      }))
                    );
                  }}
                >
                  <Text style={selectedParent ? styles.inputValue : styles.inputPlaceholder}>
                    {selectedParent
                      ? rootCategories.find(c => c.id === selectedParent)?.name || 'Родительская категория'
                      : 'Без родителя (корневая категория)'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Название категории *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Например: Овощи и фрукты"
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Ссылка на фото или HEX-код</Text>
                  <TouchableOpacity onPress={pickImage} disabled={uploading}>
                    <Text style={[styles.pickText, uploading && styles.pickTextDisabled]}>
                      {uploading ? 'Загрузка...' : 'Выбрать файл'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://... или #FF0000"
                  placeholderTextColor={Colors.light.textLight}
                />
              </View>

              {imageUrl ? (
                <View style={styles.previewSection}>
                  <Text style={styles.label}>Превью в списке:</Text>
                  {imageUrl.startsWith('#') ? (
                    <View style={[styles.previewBox, { backgroundColor: imageUrl }]} />
                  ) : (
                    <Image source={{ uri: imageUrl }} style={styles.previewBox} />
                  )}
                </View>
              ) : null}

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={Colors.light.card} />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {isEditing ? 'Сохранить изменения' : 'Создать категорию'}
                    </Text>
                  )}
                </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  card: {
    backgroundColor: Colors.light.card, borderRadius: Radius.l, padding: Spacing.m, marginBottom: Spacing.m,
    shadowColor: Colors.light.text, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2,
  },
  subcategoryCard: {
    marginLeft: Spacing.xl, // Отступ для подкатегорий
    marginRight: 0,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  imagePreview: { width: 50, height: 50, borderRadius: Radius.m, marginRight: Spacing.m },
  textContainer: { flex: 1 },
  catName: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  orderActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.s,
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.borderLight,
  },
  orderBtn: {
    padding: 4,
  },
  parentBadge: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.s },
  editText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.primary },
  deleteText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.error },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },

  // Модалка
  modalOverlay: { flex: 1, backgroundColor: Colors.light.blackTransparent, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.light.card, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: Spacing.l, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  formGroup: { marginBottom: Spacing.l },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  label: { fontSize: 14, fontWeight: '700', color: Colors.light.textSecondary },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  pickTextDisabled: { opacity: 0.5 },
  input: {
    backgroundColor: Colors.light.background, height: 50, borderRadius: Radius.m, paddingHorizontal: Spacing.m,
    fontSize: 16, color: Colors.light.text,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputValue: { color: Colors.light.text },
  inputPlaceholder: { color: Colors.light.textLight },
  previewSection: { marginBottom: Spacing.l },
  previewBox: { width: 100, height: 100, borderRadius: Radius.l, marginTop: Spacing.s },
  submitBtn: {
    backgroundColor: Colors.light.primary, height: 56, borderRadius: Radius.l,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.m, marginBottom: Spacing.xl,
  },
  submitBtnText: { color: Colors.light.card, fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});

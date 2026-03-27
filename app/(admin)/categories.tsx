import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator, Alert, FlatList, Modal, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Category } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/lib/storageUtils';

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
      .order('name');

    if (!error && data) {
      // Иерархическая сортировка: Родитель -> Дети -> Родитель -> Дети...
      const roots = data.filter((c: Category) => !c.parent_id).sort((a: Category, b: Category) => a.name.localeCompare(b.name));
      const sorted: Category[] = [];
      const usedIds = new Set<string>();

      roots.forEach((parent: Category) => {
        sorted.push(parent);
        usedIds.add(parent.id);
        const children = data
          .filter((c: Category) => c.parent_id === parent.id)
          .sort((a: Category, b: Category) => a.name.localeCompare(b.name));
        children.forEach((child: Category) => {
          sorted.push(child);
          usedIds.add(child.id);
        });
      });

      // Добавим сирот (если есть)
      const orphans = data.filter((c: Category) => !usedIds.has(c.id));
      sorted.push(...orphans);

      setCategories(sorted);
    }
    setLoading(false);
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
    const categoryData = {
      name: name.trim(),
      slug: slug,
      image_url: imageUrl.trim() || null,
      parent_id: selectedParent, // Добавляем родительскую категорию
    };

    if (isEditing && currentId) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', currentId);

      if (error) {
        Alert.alert('Ошибка обновления', error.message);
      } else {
        setCategories(prev => prev.map(c => c.id === currentId ? { ...c, ...categoryData } : c));
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
        setCategories(prev => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
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
            <Ionicons name="return-down-forward" size={20} color={Colors.light.textLight} style={{ marginRight: Spacing.s }} />
          )}
          {isHex ? (
            <View style={[styles.imagePreview, { backgroundColor: item.image_url || undefined }]} />
          ) : item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.imagePreview} />
          ) : (
            <View style={[styles.imagePreview, { backgroundColor: Colors.light.border }]} />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.catName}>{item.name}</Text>
            {isSubcategory && parentCategory && (
              <Text style={styles.parentBadge}>← {parentCategory.name}</Text>
            )}
            <Text style={styles.catUrl} numberOfLines={1}>
              {item.image_url || 'Без изображения'}
            </Text>
          </View>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEdit(item)}>
            <Ionicons name="pencil" size={18} color={Colors.light.primary} />
            <Text style={[styles.actionText, { color: Colors.light.primary }]}>Изменить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
            <Ionicons name="trash" size={18} color={Colors.light.error} />
            <Text style={[styles.actionText, { color: Colors.light.error }]}>Удалить</Text>
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
          <Ionicons name="add" size={24} color="#fff" />
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
                    const options = [
                      { title: 'Без родителя (корневая категория)', value: null },
                      ...rootCategories.map(c => ({ title: c.name, value: c.id }))
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
                  <ActivityIndicator color="#fff" />
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
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 2,
  },
  subcategoryCard: {
    marginLeft: Spacing.xl, // Отступ для подкатегорий
    marginRight: 0,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  imagePreview: { width: 50, height: 50, borderRadius: Radius.m, marginRight: Spacing.m },
  textContainer: { flex: 1 },
  catName: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 2 },
  parentBadge: {
    fontSize: 11, fontWeight: '600', color: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.s, marginTop: Spacing.xs, alignSelf: 'flex-start',
  },
  catUrl: { fontSize: 12, color: Colors.light.textLight },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.s },
  actionText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  empty: { textAlign: 'center', color: Colors.light.textSecondary, marginTop: 40 },

  // Модалка
  // eslint-disable-next-line react-native/no-color-literals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
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

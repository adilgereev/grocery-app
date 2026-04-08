import AdminCategoryPicker from '@/components/admin/AdminCategoryPicker';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { createProduct, fetchAllCategories } from '@/lib/api/adminApi';
import { uploadImage } from '@/lib/utils/storageUtils';
import { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddProductScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('1 шт');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchAllCategories();
      setCategories(data);
    } catch {
      // Ошибка загрузки категорий
    }
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
        const publicUrl = await uploadImage(result.assets[0].uri, 'products');
        setImageUrl(publicUrl);
      } catch {
        Alert.alert('Ошибка', 'Не удалось загрузить изображение');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name || !price || !categoryId) {
      Alert.alert('Ошибка', 'Заполните обязательные поля: Название, Цена и Категория');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        name,
        description,
        price: parseFloat(price),
        unit,
        image_url: imageUrl,
        category_id: categoryId,
        is_active: true,
        stock: 100,
        tags: []
      });
      Alert.alert('Успех', 'Товар успешно добавлен в каталог!', [
        { text: 'ОК', onPress: () => router.back() }
      ]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      Alert.alert('Ошибка при сохранении', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.label}>Название товара *</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Стейк Рибай"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.flexContainer}>
            <Text style={styles.label}>Цена (₽) *</Text>
            <TextInput
              style={styles.input}
              placeholder="990"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.label}>Ед. измерения</Text>
            <TextInput
              style={styles.input}
              placeholder="1 кг, 500 г, 1 шт"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        <Text style={styles.label}>Категория *</Text>
        <TouchableOpacity
          style={styles.categoryInput}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={[styles.categoryText, { color: categoryId ? Colors.light.text : Colors.light.textLight }]}>
            {selectedCategoryName || 'Выберите категорию'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.light.primary} />
        </TouchableOpacity>

        <AdminCategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Ссылка на фото (Unsplash URL)</Text>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Text style={[styles.pickText, uploading && styles.disabled]}>
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Описание товара"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить товар</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.light.card },
  content: { padding: Spacing.l, paddingBottom: 60 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.m, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  flexContainer: { flex: 1, marginRight: Spacing.s },
  categoryInput: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: { fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.5 },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.l,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' }
});

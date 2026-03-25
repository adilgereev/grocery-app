import { Colors, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/lib/storageUtils';
import AdminCategoryPicker from '@/components/AdminCategoryPicker';
import { Ionicons } from '@expo/vector-icons';

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
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
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
      } catch (error) {
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
    const { error } = await supabase.from('products').insert({
      name,
      description,
      price: parseFloat(price),
      unit,
      image_url: imageUrl,
      category_id: categoryId,
      is_active: true,
      stock: 100, // Default stock for MVP
      tags: [] // Default tags
    });

    setLoading(false);

    if (error) {
      Alert.alert('Ошибка при сохранении', error.message);
    } else {
      Alert.alert('Успех', 'Товар успешно добавлен в каталог!', [
        { text: 'ОК', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
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
          <View style={{ flex: 1, marginRight: Spacing.s }}>
            <Text style={styles.label}>Цена (₽) *</Text>
            <TextInput
              style={styles.input}
              placeholder="990"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1 }}>
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
          style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} 
          onPress={() => setPickerVisible(true)}
        >
          <Text style={{ fontSize: 16, color: categoryId ? Colors.light.text : Colors.light.textLight }}>
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
            <Text style={[styles.pickText, uploading && { opacity: 0.5 }]}>
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
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить товар</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: Spacing.l, paddingBottom: 60 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.m, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'center' },
  categoriesScroll: { marginBottom: Spacing.s },
  catBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  catBadgeActive: { backgroundColor: Colors.light.primary },
  catText: { fontSize: 14, fontWeight: '600', color: Colors.light.textSecondary },
  catTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.l,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

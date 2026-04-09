import AdminCategoryPicker from '@/components/admin/AdminCategoryPicker';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { createProduct, fetchProductForEdit, updateProduct } from '@/lib/api/adminApi';
import { showAlert } from '@/lib/utils/platformUtils';
import { useCategoryList } from '@/hooks/useCategoryList';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  mode: 'add' | 'edit';
  productId?: string;
}

/**
 * Единая форма добавления и редактирования товара.
 * Заменяет add-product.tsx / edit-product.tsx / их .web.tsx дубликаты.
 */
export default function ProductFormScreen({ mode, productId }: Props) {
  const router = useRouter();
  const { categories } = useCategoryList();
  const { imageUrl, setImageUrl, uploading, pickImage } = useImagePicker('products');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('1 шт');
  const [categoryId, setCategoryId] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name;

  // Загрузка данных товара в режиме редактирования
  const loadProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await fetchProductForEdit(productId);
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setPrice(data.price ? data.price.toString() : '');
        setUnit(data.unit || '');
        setImageUrl(data.image_url || '');
        setCategoryId(data.category_id || '');
      }
    } catch {
      showAlert('Ошибка', 'Не удалось загрузить товар');
    } finally {
      setInitialLoading(false);
    }
  }, [productId, setImageUrl]);

  useEffect(() => {
    if (mode === 'edit') {
      loadProduct();
    }
  }, [mode, loadProduct]);

  const handleSave = useCallback(async () => {
    if (!name || !price || !categoryId) {
      showAlert('Ошибка', 'Заполните обязательные поля: Название, Цена и Категория');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'add') {
        await createProduct({
          name, description,
          price: parseFloat(price), unit,
          image_url: imageUrl,
          category_id: categoryId,
          is_active: true, stock: 100, tags: [],
        });
        showAlert('Успех', 'Товар успешно добавлен в каталог!', [
          { text: 'ОК', onPress: () => router.back() },
        ]);
      } else {
        await updateProduct(productId!, {
          name, description,
          price: parseFloat(price), unit,
          image_url: imageUrl,
          category_id: categoryId,
        });
        showAlert('Успех', 'Товар успешно обновлён!', [
          { text: 'ОК', onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showAlert('Ошибка при сохранении', msg);
    } finally {
      setLoading(false);
    }
  }, [name, price, categoryId, description, unit, imageUrl, mode, productId, router]);

  if (initialLoading) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={s.skeletonField}>
            <Skeleton width={120} height={14} style={s.skeletonLabel} />
            <Skeleton width="100%" height={50} borderRadius={Radius.m} />
          </View>
        ))}
      </ScrollView>
    );
  }

  const form = (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <Text style={s.label}>Название товара *</Text>
      <TextInput
        style={s.input}
        placeholder="Например: Стейк Рибай"
        value={name}
        onChangeText={setName}
      />

      <View style={s.row}>
        <View style={s.flex}>
          <Text style={s.label}>Цена (₽) *</Text>
          <TextInput
            style={s.input}
            placeholder="990"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>
        <View style={s.flex}>
          <Text style={s.label}>Ед. измерения</Text>
          <TextInput
            style={s.input}
            placeholder="1 кг, 500 г, 1 шт"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
      </View>

      <Text style={s.label}>Категория *</Text>
      <TouchableOpacity
        style={s.categoryInput}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={[s.categoryText, { color: categoryId ? Colors.light.text : Colors.light.textLight }]}>
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

      <View style={s.labelRow}>
        <Text style={s.label}>Ссылка на фото (URL)</Text>
        {/* Кнопка выбора файла только на native */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Text style={[s.pickText, uploading && s.pickTextDisabled]}>
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={s.input}
        placeholder="https://images.unsplash.com/..."
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      <Text style={s.label}>Описание</Text>
      <TextInput
        style={[s.input, s.textArea]}
        placeholder="Описание товара"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[s.saveButton, loading && s.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
        testID="product-form-save-btn"
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.white} />
        ) : (
          <Text style={s.saveButtonText}>
            {mode === 'add' ? 'Сохранить товар' : 'Сохранить изменения'}
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );

  // На web — без KeyboardAvoidingView
  if (Platform.OS === 'web') return form;

  return (
    <KeyboardAvoidingView
      style={s.keyboardView}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {form}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.light.card },
  content: { padding: Spacing.l, paddingBottom: 60, maxWidth: 800, width: '100%', alignSelf: 'center' },
  skeletonField: { marginBottom: Spacing.m },
  skeletonLabel: { marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.m, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginTop: Spacing.m, marginBottom: 8 },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  pickTextDisabled: { opacity: 0.5 },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  flex: { flex: 1, marginRight: Spacing.s },
  categoryInput: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: { fontSize: 16 },
  textArea: { height: 100 },
  row: { flexDirection: 'row', alignItems: 'center' },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.l,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },
});

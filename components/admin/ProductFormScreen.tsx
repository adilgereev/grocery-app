import AdminCategoryPicker from '@/components/admin/AdminCategoryPicker';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { createProduct, fetchProductForEdit, updateProduct } from '@/lib/api/adminApi';
import { showAlert } from '@/lib/utils/platformUtils';
import { productSchema, ProductFormData } from '@/lib/utils/schemas';
import { useCategoryList } from '@/hooks/useCategoryList';
import { useImagePicker } from '@/hooks/useImagePicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Switch,
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

  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      price: '',
      unit: '1 шт',
      stock: '100',
      isActive: true,
      tags: '',
      calories: '',
      proteins: '',
      fats: '',
      carbohydrates: '',
      categoryId: '',
    },
  });

  const categoryId = watch('categoryId');
  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;

  // Загрузка данных товара в режиме редактирования
  const loadProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await fetchProductForEdit(productId);
      if (data) {
        reset({
          name: data.name || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          unit: data.unit || '',
          stock: data.stock != null ? data.stock.toString() : '100',
          isActive: data.is_active ?? true,
          tags: (data.tags || []).join(', '),
          calories: data.calories != null ? data.calories.toString() : '',
          proteins: data.proteins != null ? data.proteins.toString() : '',
          fats: data.fats != null ? data.fats.toString() : '',
          carbohydrates: data.carbohydrates != null ? data.carbohydrates.toString() : '',
          categoryId: data.category_id || '',
        });
        setImageUrl(data.image_url || '');
      }
    } catch {
      showAlert('Ошибка', 'Не удалось загрузить товар');
    } finally {
      setInitialLoading(false);
    }
  }, [productId, reset, setImageUrl]);

  useEffect(() => {
    if (mode === 'edit') {
      loadProduct();
    }
  }, [mode, loadProduct]);

  const onSubmit = useCallback(async (data: ProductFormData) => {
    const parsedTags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedCalories = data.calories.trim() ? parseFloat(data.calories) : null;
    const parsedProteins = data.proteins.trim() ? parseFloat(data.proteins) : null;
    const parsedFats = data.fats.trim() ? parseFloat(data.fats) : null;
    const parsedCarbohydrates = data.carbohydrates.trim() ? parseFloat(data.carbohydrates) : null;

    const payload = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      unit: data.unit,
      image_url: imageUrl,
      category_id: data.categoryId,
      is_active: data.isActive,
      stock: data.stock.trim() ? parseInt(data.stock) : 100,
      tags: parsedTags,
      calories: parsedCalories,
      proteins: parsedProteins,
      fats: parsedFats,
      carbohydrates: parsedCarbohydrates,
    };

    setLoading(true);
    try {
      if (mode === 'add') {
        await createProduct(payload);
        showAlert('Успех', 'Товар успешно добавлен в каталог!', [
          { text: 'ОК', onPress: () => router.back() },
        ]);
      } else {
        await updateProduct(productId!, payload);
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
  }, [imageUrl, mode, productId, router]);

  if (initialLoading) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={s.skeletonField}>
            <Skeleton width={120} height={14} style={s.skeletonLabel} />
            <Skeleton width="100%" height={50} borderRadius={Radius.m} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={s.keyboardView} behavior="padding" keyboardVerticalOffset={0}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>

        <Text style={s.label}>Название товара *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[s.input, errors.name && s.inputError]}
              placeholder="Например: Стейк Рибай"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.name && <Text style={s.errorText}>{errors.name.message}</Text>}

        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.label}>Цена (₽) *</Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.price && s.inputError]}
                  placeholder="990"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.price && <Text style={s.errorText}>{errors.price.message}</Text>}
          </View>
          <View style={s.flex}>
            <Text style={s.label}>Ед. измерения</Text>
            <Controller
              control={control}
              name="unit"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={s.input}
                  placeholder="1 кг, 500 г, 1 шт"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        </View>

        <Text style={s.label}>Категория *</Text>
        <TouchableOpacity
          style={[s.categoryInput, errors.categoryId && s.inputError]}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={[s.categoryText, { color: categoryId ? Colors.light.text : Colors.light.textLight }]}>
            {selectedCategoryName || 'Выберите категорию'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
        {errors.categoryId && <Text style={s.errorText}>{errors.categoryId.message}</Text>}

        <AdminCategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={(id) => setValue('categoryId', id, { shouldValidate: true })}
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
        />

        <View style={s.labelRow}>
          <Text style={s.label}>Ссылка на фото (URL)</Text>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Text style={[s.pickText, uploading && s.pickTextDisabled]}>
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={s.input}
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Text style={s.label}>Описание</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Описание товара"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && <Text style={s.errorText}>{errors.description.message}</Text>}

        {/* Остаток и статус */}
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.label}>Остаток (шт)</Text>
            <Controller
              control={control}
              name="stock"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.stock && s.inputError]}
                  placeholder="100"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="product-form-stock-input"
                />
              )}
            />
            {errors.stock && <Text style={s.errorText}>{errors.stock.message}</Text>}
          </View>
          <View style={[s.flex, s.switchContainer]}>
            <Text style={s.label}>Активен</Text>
            <Controller
              control={control}
              name="isActive"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  testID="product-form-active-switch"
                />
              )}
            />
          </View>
        </View>

        {/* Теги */}
        <Text style={s.label}>Теги</Text>
        <Controller
          control={control}
          name="tags"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={s.input}
              placeholder="молоко, свежее, ферма"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              testID="product-form-tags-input"
            />
          )}
        />
        {errors.tags && <Text style={s.errorText}>{errors.tags.message}</Text>}

        {/* КБЖУ */}
        <Text style={s.sectionHeader}>КБЖУ (на 100 г)</Text>
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.label}>Калории (ккал)</Text>
            <Controller
              control={control}
              name="calories"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.calories && s.inputError]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="product-form-calories-input"
                />
              )}
            />
            {errors.calories && <Text style={s.errorText}>{errors.calories.message}</Text>}
          </View>
          <View style={s.flex}>
            <Text style={s.label}>Белки (г)</Text>
            <Controller
              control={control}
              name="proteins"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.proteins && s.inputError]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="product-form-proteins-input"
                />
              )}
            />
            {errors.proteins && <Text style={s.errorText}>{errors.proteins.message}</Text>}
          </View>
        </View>
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.label}>Жиры (г)</Text>
            <Controller
              control={control}
              name="fats"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.fats && s.inputError]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="product-form-fats-input"
                />
              )}
            />
            {errors.fats && <Text style={s.errorText}>{errors.fats.message}</Text>}
          </View>
          <View style={s.flex}>
            <Text style={s.label}>Углеводы (г)</Text>
            <Controller
              control={control}
              name="carbohydrates"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[s.input, errors.carbohydrates && s.inputError]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  testID="product-form-carbohydrates-input"
                />
              )}
            />
            {errors.carbohydrates && <Text style={s.errorText}>{errors.carbohydrates.message}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={[s.saveButton, loading && s.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginTop: Spacing.xl,
    marginBottom: 4,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  pickTextDisabled: { opacity: 0.5 },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
  },
  flex: { flex: 1, marginRight: Spacing.s },
  switchContainer: {
    justifyContent: 'flex-start',
  },
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

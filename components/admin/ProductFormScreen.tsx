import AdminCategoryPicker from '@/components/admin/AdminCategoryPicker';
import BasicProductFields from '@/components/admin/BasicProductFields';
import ProductFormSkeleton from '@/components/admin/ProductFormSkeleton';
import ProductImageField from '@/components/admin/ProductImageField';
import ProductNutrientsSection from '@/components/admin/ProductNutrientsSection';
import { s } from '@/components/admin/ProductFormScreen.styles';
import { Colors } from '@/constants/theme';
import { useProductForm } from '@/hooks/forms/useProductForm';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
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
  const {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    initialLoading,
    pickerVisible,
    setPickerVisible,
    categoryId,
    selectedCategoryName,
    imageUrl,
    setImageUrl,
    uploading,
    pickImage,
    categories,
    setValue,
  } = useProductForm({ mode, productId });

  if (initialLoading) {
    return <ProductFormSkeleton />;
  }

  return (
    <KeyboardAvoidingView style={s.keyboardView} behavior="padding" keyboardVerticalOffset={0}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>

        <BasicProductFields control={control} errors={errors} />

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

        <ProductImageField imageUrl={imageUrl} setImageUrl={setImageUrl} uploading={uploading} pickImage={pickImage} />

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

        <ProductNutrientsSection control={control} errors={errors} />

        <TouchableOpacity
          style={[s.saveButton, loading && s.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit as any)}
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

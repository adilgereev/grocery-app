import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Category } from '@/types';
import { useImagePicker } from '@/hooks/useImagePicker';
import { showAlert } from '@/lib/utils/platformUtils';
import { slugify } from '@/lib/utils/slugify';

import CategoryImagePicker from './category-form/CategoryImagePicker';
import CategoryParentSelector from './category-form/CategoryParentSelector';

interface CategoryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  initialData?: Category | null;
  rootCategories: Category[];
  isSubmitting: boolean;
}

/**
 * Форма создания/редактирования категории в модальном окне.
 * Вынесена из app/(admin)/categories.tsx для декомпозиции.
 */
export default function CategoryFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  rootCategories,
  isSubmitting,
}: CategoryFormModalProps) {
  const [name, setName] = React.useState('');
  const [selectedParent, setSelectedParent] = React.useState<string | null>(null);
  const [isActive, setIsActive] = React.useState(true);
  const { imageUrl, setImageUrl, uploading, pickImage } = useImagePicker('categories');

  // Инициализация полей при открытии для редактирования
  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setImageUrl(initialData?.image_url || '');
      setSelectedParent(initialData?.parent_id || null);
      setIsActive(initialData?.is_active ?? true);
    }
  }, [visible, initialData, setImageUrl]);

  const handleFormSubmit = () => {
    if (!name.trim()) {
      showAlert('Ошибка', 'Введите название категории');
      return;
    }

    const slug = slugify(name);
    onSubmit({
      name: name.trim(),
      slug,
      image_url: imageUrl.trim() || null,
      parent_id: selectedParent,
      is_active: isActive,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'Редактировать категорию' : 'Новая категория'}
            </Text>
            <TouchableOpacity onPress={onClose} testID="close-modal-btn">
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Родительская категория */}
            <CategoryParentSelector
              selectedParent={selectedParent}
              onSelect={setSelectedParent}
              rootCategories={rootCategories}
              currentCategoryId={initialData?.id}
            />

            {/* Название */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Название категории *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Например: Овощи и фрукты"
                placeholderTextColor={Colors.light.textLight}
                testID="category-name-input"
              />
            </View>

            {/* Изображение */}
            <CategoryImagePicker
              imageUrl={imageUrl}
              onChange={setImageUrl}
              onPickImage={pickImage}
              uploading={uploading}
            />

            {/* Видимость */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Видна покупателям</Text>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  testID="category-active-switch"
                />
              </View>
            </View>

            {/* Кнопка отправки */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleFormSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              testID="submit-category-btn"
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {initialData ? 'Сохранить изменения' : 'Создать категорию'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: Colors.light.blackTransparent, 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: Colors.light.card, 
    borderTopLeftRadius: Radius.xxl, 
    borderTopRightRadius: Radius.xxl, 
    padding: Spacing.l, 
    maxHeight: '80%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.xl 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: Colors.light.text 
  },
  formGroup: { 
    marginBottom: Spacing.l 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s
  },
  input: {
    backgroundColor: Colors.light.background, 
    height: 50, 
    borderRadius: Radius.m, 
    paddingHorizontal: Spacing.m,
    fontSize: 16, 
    color: Colors.light.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: Colors.light.primary, 
    height: 56, 
    borderRadius: Radius.l,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: Spacing.m, 
    marginBottom: Spacing.xl,
  },
  submitBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700'
  },
  btnDisabled: { 
    opacity: 0.6 
  },
});

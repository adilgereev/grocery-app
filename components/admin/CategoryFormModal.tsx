import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { Category } from '@/types';
import { useImagePicker } from '@/hooks/useImagePicker';
import { showAlert } from '@/lib/utils/platformUtils';
import { slugify } from '@/lib/utils/slugify';

import CategoryImagePicker from './category-form/CategoryImagePicker';
import CategoryParentSelector from './category-form/CategoryParentSelector';
import CategorySubmitButton from './category-form/CategorySubmitButton';
import { styles } from './category-form/CategoryFormModal.styles';

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
 * Декомпозирована: стили и кнопка вынесены в отдельные файлы.
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
            <CategoryParentSelector
              selectedParent={selectedParent}
              onSelect={setSelectedParent}
              rootCategories={rootCategories}
              currentCategoryId={initialData?.id}
            />

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

            <CategoryImagePicker
              imageUrl={imageUrl}
              onChange={setImageUrl}
              onPickImage={pickImage}
              uploading={uploading}
            />

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

            <CategorySubmitButton
              isSubmitting={isSubmitting}
              onPress={handleFormSubmit}
              isEdit={!!initialData}
              testID="submit-category-btn"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

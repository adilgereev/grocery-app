import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
  const { imageUrl, setImageUrl, uploading, pickImage } = useImagePicker('categories');

  // Инициализация полей при открытии для редактирования
  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setImageUrl(initialData?.image_url || '');
      setSelectedParent(initialData?.parent_id || null);
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
    });
  };

  const selectParentCategory = () => {
    // Исключаем саму редактируемую категорию из списка возможных родителей
    const availableParents = rootCategories.filter(c => c.id !== initialData?.id);
    
    const options = [
      { text: 'Без родителя (корневая)', onPress: () => setSelectedParent(null) },
      ...availableParents.map(c => ({
        text: c.name,
        onPress: () => setSelectedParent(c.id)
      })),
      { text: 'Отмена', style: 'cancel' as const }
    ];

    Alert.alert('Выберите родительскую категорию', '', options);
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
            <View style={styles.formGroup}>
              <Text style={styles.label}>Родительская категория</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={selectParentCategory}
                testID="parent-category-selector"
              >
                <Text style={selectedParent ? styles.inputValue : styles.inputPlaceholder}>
                  {selectedParent
                    ? rootCategories.find(c => c.id === selectedParent)?.name || 'Родительская категория'
                    : 'Без родителя (корневая категория)'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

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
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Ссылка на фото или HEX-код</Text>
                <TouchableOpacity onPress={pickImage} disabled={uploading} testID="pick-image-btn">
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
                testID="category-image-input"
              />
            </View>

            {/* Превью */}
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
  labelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.s 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: Colors.light.textSecondary 
  },
  pickText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: Colors.light.primary 
  },
  pickTextDisabled: { 
    opacity: 0.5 
  },
  input: {
    backgroundColor: Colors.light.background, 
    height: 50, 
    borderRadius: Radius.m, 
    paddingHorizontal: Spacing.m,
    fontSize: 16, 
    color: Colors.light.text,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  inputValue: { 
    color: Colors.light.text 
  },
  inputPlaceholder: { 
    color: Colors.light.textLight 
  },
  previewSection: { 
    marginBottom: Spacing.l 
  },
  previewBox: { 
    width: 100, 
    height: 100, 
    borderRadius: Radius.l, 
    marginTop: Spacing.s 
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

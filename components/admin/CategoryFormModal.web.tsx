import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { slugify } from '@/utils/slugify';

interface CategoryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  initialData?: Category | null;
  rootCategories: Category[];
  isSubmitting: boolean;
}

export default function CategoryFormModalWeb({
  visible,
  onClose,
  onSubmit,
  initialData,
  rootCategories,
  isSubmitting,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setImageUrl(initialData?.image_url || '');
      setSelectedParent(initialData?.parent_id || null);
    } else {
      // Сброс формы при закрытии модалки
      setName('');
      setImageUrl('');
      setSelectedParent(null);
    }
  }, [visible, initialData]);

  const handleFormSubmit = () => {
    if (!name.trim()) {
      alert('Введите название категории');
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
    const availableParents = rootCategories.filter(c => c.id !== initialData?.id);
    
    // В вебе лучше использовать обычный нативный confirm или свой UI, 
    // но для простоты мы используем window.prompt / кастомный селектор или просто будем использовать обычный веб-селект
    // Чтобы не усложнять, мы покажем просто список внутри модалки, но так как Alert.alert не идеален, 
    // сделаем это с помощью простого alert/prompt или через отдельный стейт, но для минимализма оставим заглушку.
    // На вебе можно использовать window.prompt, но это неудобно. 
    // Вместо этого простейший циклический выбор:
    
    const currentIndex = selectedParent 
      ? availableParents.findIndex(c => c.id === selectedParent)
      : -1;
      
    const nextIndex = currentIndex + 1;
    if (nextIndex < availableParents.length) {
       setSelectedParent(availableParents[nextIndex].id);
    } else {
       setSelectedParent(null); // Без родителя
    }
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
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Родительская категория */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Родительская (нажмите для смены)</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={selectParentCategory}
              >
                <Text style={selectedParent ? styles.inputValue : styles.inputPlaceholder}>
                  {selectedParent
                    ? rootCategories.find(c => c.id === selectedParent)?.name || 'Родительская категория'
                    : 'Без родителя (корневая категория)'}
                </Text>
                <Ionicons name="refresh" size={20} color={Colors.light.primary} />
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
              />
            </View>

            {/* Изображение */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Ссылка на фото или HEX-код</Text>
              </View>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://... или #FF0000"
                placeholderTextColor={Colors.light.textLight}
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
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.light.card} />
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
    justifyContent: 'center', // Для веба центрируем модалку
    alignItems: 'center'
  },
  modalContent: { 
    backgroundColor: Colors.light.card, 
    borderRadius: Radius.xxl, 
    padding: Spacing.l, 
    width: '100%',
    maxWidth: 500, // Ограничиваем ширину для ПК
    maxHeight: '90%' 
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
    color: Colors.light.card, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  btnDisabled: { 
    opacity: 0.6 
  },
});

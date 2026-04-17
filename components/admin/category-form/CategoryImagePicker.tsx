import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

interface CategoryImagePickerProps {
  imageUrl: string;
  onChange: (url: string) => void;
  onPickImage: () => void;
  uploading: boolean;
}

export default function CategoryImagePicker({
  imageUrl,
  onChange,
  onPickImage,
  uploading,
}: CategoryImagePickerProps) {
  return (
    <>
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Ссылка на фото или HEX-код</Text>
          <TouchableOpacity onPress={onPickImage} disabled={uploading} testID="pick-image-btn">
            <Text style={[styles.pickText, uploading && styles.pickTextDisabled]}>
              {uploading ? 'Загрузка...' : 'Выбрать файл'}
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={onChange}
          placeholder="https://... или #FF0000"
          placeholderTextColor={Colors.light.textLight}
          testID="category-image-input"
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
    </>
  );
}

const styles = StyleSheet.create({
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
});

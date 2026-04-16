import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ProductImageFieldProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  uploading: boolean;
  pickImage: () => void;
}

export default function ProductImageField({
  imageUrl,
  setImageUrl,
  uploading,
  pickImage,
}: ProductImageFieldProps) {
  return (
    <>
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
    </>
  );
}

const s = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.m,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  pickText: { fontSize: 14, fontWeight: '700', color: Colors.light.primary },
  pickTextDisabled: { opacity: 0.5 },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
});

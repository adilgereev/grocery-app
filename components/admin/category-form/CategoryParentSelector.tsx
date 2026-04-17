import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Category } from '@/types';

interface CategoryParentSelectorProps {
  selectedParent: string | null;
  onSelect: (parentId: string | null) => void;
  rootCategories: Category[];
  currentCategoryId?: string;
}

export default function CategoryParentSelector({
  selectedParent,
  onSelect,
  rootCategories,
  currentCategoryId,
}: CategoryParentSelectorProps) {
  const handlePress = () => {
    // Исключаем саму редактируемую категорию из списка возможных родителей
    const availableParents = rootCategories.filter(c => c.id !== currentCategoryId);
    
    const options = [
      { text: 'Без родителя (корневая)', onPress: () => onSelect(null) },
      ...availableParents.map(c => ({
        text: c.name,
        onPress: () => onSelect(c.id)
      })),
      { text: 'Отмена', style: 'cancel' as const }
    ];

    Alert.alert('Выберите родительскую категорию', '', options);
  };

  const parentName = selectedParent 
    ? rootCategories.find(c => c.id === selectedParent)?.name || 'Родительская категория'
    : 'Без родителя (корневая категория)';

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Родительская категория</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={handlePress}
        testID="parent-category-selector"
      >
        <Text style={selectedParent ? styles.inputValue : styles.inputPlaceholder}>
          {parentName}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.light.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

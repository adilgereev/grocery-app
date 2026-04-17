import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

interface SearchHeaderProps {
  query: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: (text: string) => void;
  onClear: () => void;
  onBack: () => void;
}

export default function SearchHeader({
  query,
  onChangeText,
  onSubmitEditing,
  onClear,
  onBack,
}: SearchHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
      </TouchableOpacity>

      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Что вы ищете?"
          placeholderTextColor={Colors.light.textLight}
          value={query}
          onChangeText={onChangeText}
          onSubmitEditing={(e) => onSubmitEditing(e.nativeEvent.text)}
          returnKeyType="search"
          autoFocus
          testID="search-input"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} testID="search-clear">
            <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.s,
    marginRight: Spacing.s,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});

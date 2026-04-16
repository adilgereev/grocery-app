import React, { useCallback } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

interface Props {
  query: string;
  onChangeText: (text: string) => void;
}

export function CatalogSearchBar({ query, onChangeText }: Props) {
  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color={Colors.light.textLight} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск товара..."
        placeholderTextColor={Colors.light.textLight}
        value={query}
        onChangeText={handleChangeText}
        clearButtonMode="while-editing"
        testID="catalog-search-input"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: Spacing.m,
    marginTop: Spacing.m,
    borderRadius: Radius.l,
    paddingHorizontal: Spacing.m,
    ...Shadows.sm,
  },
  searchIcon: { marginRight: Spacing.s },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: Colors.light.text,
  },
});

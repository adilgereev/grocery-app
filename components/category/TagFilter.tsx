import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagPress: (tag: string | null) => void;
}

export default function TagFilter({ tags, activeTag, onTagPress }: TagFilterProps) {
  const handlePress = useCallback((tag: string | null) => {
    onTagPress(tag);
  }, [onTagPress]);

  if (tags.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.badge, activeTag === null && styles.badgeActive]}
          onPress={() => handlePress(null)}
        >
          <Text style={[styles.text, activeTag === null && styles.textActive]}>Все</Text>
        </TouchableOpacity>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.badge, activeTag === tag && styles.badgeActive]}
            onPress={() => handlePress(tag)}
          >
            <Text style={[styles.text, activeTag === tag && styles.textActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: Spacing.m,
    marginBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    height: 38,
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: Colors.light.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  textActive: {
    color: Colors.light.white,
  },
});

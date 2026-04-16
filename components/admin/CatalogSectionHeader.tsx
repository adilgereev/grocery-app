import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { RootHeaderItem, SubHeaderItem } from '@/lib/utils/catalogHierarchy';

interface Props {
  item: RootHeaderItem | SubHeaderItem;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CatalogSectionHeader({ item, isCollapsed, onToggle }: Props) {
  const handlePress = useCallback(onToggle, [onToggle]);

  if (item.type === 'root_header') {
    return (
      <TouchableOpacity style={styles.rootHeader} onPress={handlePress} activeOpacity={0.7}>
        <Text style={styles.rootTitle}>{item.title}</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{item.count}</Text>
        </View>
        <Ionicons
          name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
          size={20}
          color={Colors.light.textSecondary}
          style={styles.rootChevron}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.subHeader} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="return-down-forward" size={16} color={Colors.light.textLight} style={styles.subIcon} />
      <Text style={styles.subTitle}>{item.title}</Text>
      <View style={styles.subBadge}>
        <Text style={styles.subBadgeText}>{item.count}</Text>
      </View>
      <Ionicons
        name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
        size={16}
        color={Colors.light.textLight}
        style={styles.rootChevron}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rootHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.s,
    paddingTop: Spacing.m,
  },
  rootTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  sectionBadge: {
    backgroundColor: Colors.light.border,
    borderRadius: Radius.m,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: Spacing.s,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.light.textSecondary },
  rootChevron: { marginLeft: 'auto' as const },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.s,
    paddingLeft: Spacing.m,
  },
  subIcon: { marginRight: 6 },
  subTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.textSecondary },
  subBadge: {
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.m,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: Spacing.s,
  },
  subBadgeText: { fontSize: 11, fontWeight: '600', color: Colors.light.textLight },
});

import { Colors, Radius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AdminMenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: number;
  testID?: string;
}

export default function AdminMenuItem({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  testID,
}: AdminMenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} testID={testID}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={24} color={Colors.light.primary} />
        {!!badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
    backgroundColor: Colors.light.primaryLight,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.warning,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.white,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});

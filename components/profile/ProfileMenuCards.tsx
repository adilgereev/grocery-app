import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

interface ProfileMenuCardsProps {
  isAdmin: boolean;
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export default function ProfileMenuCards({ isAdmin, onLogout, onNavigate }: ProfileMenuCardsProps) {
  return (
    <>
      {/* Global Menu Card */}
      <View style={styles.menuCard}>
        {/* Bonuses */}
        <TouchableOpacity
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => Alert.alert('Бонусы', 'У вас 0 баллов. Делайте покупки, чтобы накопить кэшбэк.')}
          testID="profile-menu-bonuses"
        >
          <Ionicons name="diamond-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Бонусный баланс</Text>
          <Text style={styles.bonusValue}>0 ₽</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        {/* Admin Tools */}
        {isAdmin && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => onNavigate('/(admin)' as any)}
              testID="profile-menu-admin"
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
              <Text style={styles.menuText}>Панель управления</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
            </TouchableOpacity>
            <View style={styles.divider} />
          </>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('/orders')}
          testID="profile-menu-orders"
        >
          <Ionicons name="receipt-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>История заказов</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('/addresses')}
          testID="profile-menu-addresses"
        >
          <Ionicons name="location-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Мои адреса</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('/favorites')}
          testID="profile-menu-favorites"
        >
          <Ionicons name="heart-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Избранное</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
      </View>

      {/* Secondary Menu Card */}
      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Поддержка', 'Чат с поддержкой временно недоступен.')}
          testID="profile-menu-support"
        >
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Связаться с нами</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('/privacy-policy')}
          testID="profile-menu-privacy"
        >
          <Ionicons name="document-text-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Политика конфиденциальности</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate('/public-offer')}
          testID="profile-menu-public-offer"
        >
          <Ionicons name="reader-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Публичная оферта</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
        </TouchableOpacity>
        <View style={styles.divider} />

        <View style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>О приложении</Text>
          <Text style={styles.appVersion}>1.0</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.7}
        testID="profile-logout-button"
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
        <Text style={styles.logoutText}>Выйти из профиля</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
    marginBottom: Spacing.l,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  menuItemIcon: {
    marginRight: Spacing.m,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  bonusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
    marginRight: Spacing.s,
  },
  appVersion: {
    fontSize: 13,
    color: Colors.light.textLight,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: 15,
    fontWeight: '600',
  },
});

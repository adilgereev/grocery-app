import Skeleton from '@/components/ui/Skeleton';
import { Colors, FontSize, Radius, Spacing, Shadows } from '@/constants/theme';
import { logger } from '@/lib/utils/logger';
import { formatPhoneDisplay } from '@/lib/services/sms';
import { fetchUserProfile, signOut } from '@/lib/api/authApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { Profile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const clearCart = useCartStore(state => state.clearCart);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      setLoading(true);
      const data = await fetchUserProfile(session.user.id);
      if (data) setProfile(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      logger.error('Ошибка загрузки профиля:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) {
        fetchProfile();
      }
    }, [session, fetchProfile])
  );

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: performLogout }
    ]);
  };

  const performLogout = async () => {
    await signOut();
    clearCart();
  };

  const getInitials = () => {
    if (!profile) return '?';
    const f = profile.first_name ? profile.first_name.charAt(0).toUpperCase() : '';
    const l = profile.last_name && profile.last_name !== 'null' ? profile.last_name.charAt(0).toUpperCase() : '';
    return (f + l) || 'U';
  };

  const getDisplayName = () => {
    if (!profile) return session?.user.email || 'Пользователь';
    const first = profile.first_name || '';
    const last = (profile.last_name && profile.last_name !== 'null') ? profile.last_name : '';

    if (first || last) {
      return `${first} ${last}`.trim();
    }
    return session?.user.email || 'Пользователь';
  };

  if (!session) {
    return (
      <View style={[styles.guestContainer, { paddingTop: insets.top }]}>
        <View style={styles.guestContent}>
          <View style={styles.guestAvatarIcon}>
            <Ionicons name="person" size={44} color={Colors.light.primary} />
          </View>
          <Text style={styles.guestTitle}>
            Ваш профиль
          </Text>
          <Text style={styles.guestSubtitle}>
            Войдите, чтобы оформлять заказы,{'\n'}копить бонусы и видеть историю покупок
          </Text>

          <TouchableOpacity
            style={styles.guestButton}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
            testID="profile-guest-login-button"
          >
            <View style={styles.guestButtonSolid}>
              <Text style={styles.guestButtonText}>Войти или зарегистрироваться</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
        <Text style={styles.headerTitle}>Профиль</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        {loading && !profile ? (
          <Skeleton width="100%" height={80} borderRadius={Radius.xl} style={{ marginBottom: Spacing.l }} />
        ) : (
          <TouchableOpacity
            style={styles.userCard}
            activeOpacity={0.8}
            onPress={() => router.push('/edit-profile')}
            testID="profile-user-card"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{getDisplayName()}</Text>
              <Text style={styles.userPhone}>{profile?.phone ? formatPhoneDisplay(profile.phone) : 'Телефон не указан'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}

        {/* Global Menu Card (Lite & Clean) */}
        <View style={styles.menuCard}>
          {/* Bonuses (New Lite Field) */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => Alert.alert('Бонусы', 'У вас 0 баллов. Делайте покупки, чтобы накопить кэшбэк.')} testID="profile-menu-bonuses">
            <Ionicons name="diamond-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Бонусный баланс</Text>
            <Text style={styles.bonusValue}>0 ₽</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Admin Tools */}
          {profile?.is_admin && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)' as any)} testID="profile-menu-admin">
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
                <Text style={styles.menuText}>Панель управления</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')} testID="profile-menu-orders">
            <Ionicons name="receipt-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>История заказов</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/addresses')} testID="profile-menu-addresses">
            <Ionicons name="location-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Мои адреса</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')} testID="profile-menu-favorites">
            <Ionicons name="heart-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Избранное</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Поддержка', 'Чат с поддержкой временно недоступен.')} testID="profile-menu-support">
            <Ionicons name="chatbubbles-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Связаться с нами</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>О приложении</Text>
            <Text style={styles.appVersion}>1.0</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
          testID="profile-logout-button"
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
          <Text style={styles.logoutText}>Выйти из профиля</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.ml,
    backgroundColor: Colors.light.background, // Чат на фоне приложения для легкости
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.big, // Крупный заголовок по фидбеку (28px)
    fontWeight: '700',
    color: Colors.light.text,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  guestContent: {
    alignItems: 'center',
  },
  guestAvatarIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    // Легкая тень иконки
    ...Shadows.md,
  },
  guestTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  guestButton: {
    width: '100%',
    height: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  guestButtonSolid: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.ml,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    // Облегченные тени
    ...Shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 1,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
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
    color: Colors.light.primary, // Акцент на бонусах
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
  footerSpacing: {
    height: Spacing.xxl,
  },
});

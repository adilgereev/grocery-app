import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { Profile } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/lib/logger';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { formatPhoneDisplay } from '@/lib/sms';
import Skeleton from '@/components/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (error) throw error;
      if (data) setProfile(data as Profile);
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
    if (Platform.OS !== 'web') {
      Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: performLogout }
      ]);
    } else {
      if (window.confirm('Вы уверены, что хотите выйти из аккаунта?')) performLogout();
    }
  };

  const performLogout = async () => {
    await supabase.auth.signOut();
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
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => Alert.alert('Бонусы', 'У вас 0 баллов. Делайте покупки, чтобы накопить кэшбэк.')}>
            <Ionicons name="diamond-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Бонусный баланс</Text>
            <Text style={styles.bonusValue}>0 ₽</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Admin Tools */}
          {profile?.is_admin && (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)' as any)}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
                <Text style={styles.menuText}>Панель управления</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
              </TouchableOpacity>
              <View style={styles.divider} />
            </>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <Ionicons name="receipt-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>История заказов</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/addresses')}>
            <Ionicons name="location-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Мои адреса</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
            <Ionicons name="heart-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Избранное</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Поддержка', 'Чат с поддержкой временно недоступен.')}>
            <Ionicons name="chatbubbles-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Связаться с нами</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>О приложении</Text>
            <Text style={styles.appVersion}>2.0.0</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
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
    paddingHorizontal: 20,
    backgroundColor: Colors.light.background, // Чат на фоне приложения для легкости
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.big, // Крупный заголовок по фидбеку (28px)
    fontWeight: '800',
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
    borderRadius: 40,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    // Легкая тень иконки
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  guestTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  guestButton: {
    width: '100%',
    height: 56,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  guestButtonSolid: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: 24, // Увеличил отступ, так как убрали карту
    // Облегченные тени
    shadowColor: Colors.light.text,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
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
    shadowColor: Colors.light.text,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemIcon: {
    marginRight: 16,
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
    marginRight: 8,
  },
  appVersion: {
    fontSize: 13,
    color: Colors.light.textLight,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: 15,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 40,
  },
});

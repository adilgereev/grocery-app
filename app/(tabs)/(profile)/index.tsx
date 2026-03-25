import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import Skeleton from '@/components/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const setHasSeenOnboarding = useAppStore(state => state.setHasSeenOnboarding);
  const { session } = useAuth();
  const clearCart = useCartStore(state => state.clearCart);
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{first_name: string, last_name: string, phone: string, is_admin?: boolean} | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (session?.user) {
        fetchProfile();
      }
    }, [session])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, is_admin')
        .eq('id', session?.user.id)
        .single();
        
      if (error) throw error;
      if (data) setProfile(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Ошибка загрузки профиля:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    const l = profile.last_name ? profile.last_name.charAt(0).toUpperCase() : '';
    return (f + l) || 'U';
  };

  const getDisplayName = () => {
    if (!profile) return session?.user.email || 'Пользователь';
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`.trim();
    }
    return session?.user.email || 'Пользователь';
  };

  // --- ГОСТЕВОЙ ЭКРАН ---
  if (!session) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.light.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.l }}>
          <Ionicons name="person" size={40} color={Colors.light.primary} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.light.text, textAlign: 'center', marginBottom: Spacing.s }}>
          Войдите в профиль
        </Text>
        <Text style={{ fontSize: 16, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 }}>
          Чтобы отслеживать статусы заказов, сохранять адреса доставки и копить бонусы
        </Text>
        
        <TouchableOpacity 
          style={{ width: '100%', backgroundColor: Colors.light.primary, paddingVertical: 16, borderRadius: Radius.l, alignItems: 'center', elevation: 4, shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 }}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Войти или зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Мой Профиль</Text>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Header Card */}
        {loading && !profile ? (
          <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: Spacing.l }} />
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
              <Text style={styles.userPhone}>{profile?.phone || 'Телефон не указан'}</Text>
            </View>
            <View style={styles.editIconContainer}>
              <Ionicons name="pencil" size={18} color={Colors.light.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Admin Section (Conditional) */}
        {profile?.is_admin && (
          <>
            <Text style={styles.sectionTitle}>Управление Магазином</Text>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)' as any)}>
                <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
                </View>
                <Text style={styles.menuText}>Панель Владельца</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Menu Section 1: Purchases */}
        <Text style={styles.sectionTitle}>Покупки</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="receipt" size={20} color="#6366F1" />
            </View>
            <Text style={styles.menuText}>Мои заказы</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/addresses')}>
            <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="location" size={20} color={Colors.light.primary} />
            </View>
            <Text style={styles.menuText}>Мои адреса</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="heart" size={20} color={Colors.light.error} />
            </View>
            <Text style={styles.menuText}>Избранные товары</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Settings & Info */}
        <Text style={styles.sectionTitle}>Приложение</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Промокоды', 'У вас пока нет активных промокодов.')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="ticket" size={20} color={Colors.light.warning} />
            </View>
            <Text style={styles.menuText}>Промокоды и скидки</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Поддержка', 'Чат с поддержкой временно недоступен.')}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="chatbubbles" size={20} color={Colors.light.textSecondary} />
            </View>
            <Text style={styles.menuText}>Служба поддержки</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="information-circle" size={20} color={Colors.light.textSecondary} />
            </View>
            <Text style={styles.menuText}>О приложении</Text>
            <Text style={styles.appVersion}>Версия 2.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        {/* Dev Tools */}
        <TouchableOpacity 
          style={styles.devButton} 
          onPress={() => {
             setHasSeenOnboarding(false);
             Alert.alert('Сброшено', 'Экраны онбординга снова появятся после выхода.');
          }}
        >
          <Text style={styles.devButtonText}>[🛠 Тест] Сброс онбординга</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  screenTitle: {
    fontSize: 32, // Увеличенный размер как в Apple Music / App Store
    fontWeight: '800',
    color: Colors.light.text,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: 28,
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  editIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    marginLeft: Spacing.xs,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.s,
    marginBottom: 28,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.m,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.light.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 72, 
    marginRight: Spacing.m,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: Radius.l,
    paddingVertical: Spacing.m,
    alignItems: 'center',
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '700',
  },
  devButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  devButtonText: {
    color: Colors.light.textLight,
    fontSize: 13,
  }
});

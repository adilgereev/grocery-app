import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserProfile, signOut } from '@/lib/api/authApi';
import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { logger } from '@/lib/utils/logger';
import { Profile } from '@/types';

interface UseProfileReturn {
  loading: boolean;
  profile: Profile | null;
  initials: string;
  displayName: string;
  handleLogout: () => void;
}

export function useProfile(): UseProfileReturn {
  const { session } = useAuth();
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

  const getInitials = () => {
    if (!profile) return '?';
    return profile.first_name?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (!profile) return session?.user.email || 'Пользователь';
    return profile.first_name || session?.user.email || 'Пользователь';
  };

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

  return {
    loading,
    profile,
    initials: getInitials(),
    displayName: getDisplayName(),
    handleLogout,
  };
}

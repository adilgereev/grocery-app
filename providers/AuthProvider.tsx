import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/utils/logger';
import { Profile } from '@/types';
import { fetchUserProfile } from '@/lib/api/authApi';
import { useAddressStore } from '@/store/addressStore';
import { useCartStore } from '@/store/cartStore';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  needsProfileSetup: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  profile: null,
  profileLoading: true,
  needsProfileSetup: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Функция для сохранения телефона в профиль (с проверкой на дубликат)
const savePhoneToProfile = async (userId: string, phone: string) => {
  try {
    // Сначала проверяем, есть ли телефон в профиле
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .maybeSingle();

    // Если телефон в профиле совпадает с текущим — не сохраняем (избежать дубликатов)
    if (existingProfile?.phone === phone) {
      logger.log('Телефон уже в профиле, пропускаем сохранение:', phone);
      return; // Телефон уже есть
// Возвращаем успех, даже если ничего не меняли
    }

    // Если телефона нет или отличается — сохраняем
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId);

    if (updateError) {
      // Телефон уже привязан к другому аккаунту (unique_violation)
      if (updateError.code === '23505') {
        logger.warn('Телефон уже привязан к другому аккаунту:', phone);
        return false;
      }
      throw updateError;
    }
    
    logger.log('Телефон успешно сохранён в профиль:', phone);
    return true;
  } catch (error) {
    logger.error('Ошибка сохранения телефона:', error);
    return false;
  }
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const phoneSynced = useRef(false); // Флаг синхронизации за сессию

  // Загрузка профиля из БД
  const loadProfile = useCallback(async (userId: string) => {
    try {
      setProfileLoading(true);
      let data = await fetchUserProfile(userId);

      // Профиля нет — пересоздаём (например, после удаления из БД)
      if (!data) {
        logger.warn('Профиль не найден, пересоздаём...');
        const phone = (await supabase.auth.getUser()).data.user?.user_metadata?.phone || '';
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: userId,
          first_name: null,
          phone,
        });
        if (upsertError) throw upsertError;
        data = await fetchUserProfile(userId);
      }

      setProfile(data);
    } catch (error) {
      logger.error('Ошибка загрузки профиля:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Публичный метод для обновления профиля (после сохранения имени)
  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    await loadProfile(session.user.id);
  }, [session, loadProfile]);

  // Профиль нужно дозаполнить (first_name ещё null)
  // Если профиля нет вообще — это сломанное состояние, пользователя нужно разлогинить
  const needsProfileSetup = !!session && !profileLoading && profile !== null && profile.first_name === null;

  useEffect(() => {
    // Сначала быстро берем локальную сессию для мгновенного UI
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      if (session) {
        // Загружаем профиль
        loadProfile(session.user.id);

        // Проверяем сохранённый промокод — мог истечь пока приложение было закрыто
        useCartStore.getState().revalidatePromoCode();

        // Асинхронно сверяем с сервером (вдруг юзер удален из базы)
        supabase.auth.getUser().then(({ error, data: { user } }) => {
          if (error || !user) {
            logger.warn('Токен невалиден или юзер удалён в БД. Разлогиниваем...');
            supabase.auth.signOut();
            setSession(null);
          }
        });
      } else {
        setProfileLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // Сбрасываем флаги при выходе
      if (event === 'SIGNED_OUT') {
        phoneSynced.current = false;
        setProfile(null);
        setProfileLoading(false);
        useAddressStore.getState().clearAddresses();
        return;
      }

      // Загружаем профиль при любом входе (SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED)
      if (session?.user) {
        loadProfile(session.user.id);
      }

      // Сохраняем телефон только один раз за сессию
      if (!phoneSynced.current && session?.user) {
        const phone = session.user.user_metadata?.phone || session.user.phone;
        if (phone) {
          const success = await savePhoneToProfile(session.user.id, phone);
          if (success) {
            phoneSynced.current = true;
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile, profileLoading, needsProfileSetup, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

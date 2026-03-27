import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const useAuth = () => useContext(AuthContext);

// Функция для сохранения телефона в профиль (с проверкой на дубликат)
const savePhoneToProfile = async (userId: string, phone: string) => {
  try {
    // Сначала проверяем, есть ли телефон в профиле
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single();

    // Если телефон в профиле совпадает с текущим — не сохраняем (избежать дубликатов)
    if (existingProfile?.phone === phone) {
      console.log('Телефон уже в профиле, пропускаем сохранение:', phone);
      return true; // Возвращаем успех, даже если ничего не меняли
    }

    // Если телефона нет или отличается — сохраняем
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId);

    if (updateError) throw updateError;
    
    console.log('Телефон успешно сохранён в профиль:', phone);
    return true;
  } catch (error) {
    console.error('Ошибка сохранения телефона:', error);
    return false;
  }
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const phoneSynced = useRef(false); // Флаг синхронизации за сессию

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // Сбрасываем флаг при выходе
      if (event === 'SIGNED_OUT') {
        phoneSynced.current = false;
        return;
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
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

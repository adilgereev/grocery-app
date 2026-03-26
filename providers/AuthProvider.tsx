import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ session: null, loading: true });

export const useAuth = () => useContext(AuthContext);

// Функция для сохранения телефона в профиль
const savePhoneToProfile = async (userId: string, phone: string) => {
  try {
    await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId);
  } catch (error) {
    console.error('Ошибка сохранения телефона:', error);
  }
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // Сохраняем телефон при авторизации
      // Проверяем user_metadata.phone (хранится при регистрации) и user.phone (если есть)
      const phone = session?.user?.user_metadata?.phone || session?.user?.phone;
      if (phone) {
        await savePhoneToProfile(session.user.id, phone);
        console.log('Телефон сохранён в профиль:', phone);
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

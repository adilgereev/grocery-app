import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdmin();
  }, [session]);

  const checkAdmin = async () => {
    if (!session?.user) {
      router.replace('/');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (data?.is_admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      router.replace('/'); // Отправляем обратно, если не админ
    }
  };

  if (isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerStyle: { backgroundColor: '#fff' },
      headerTintColor: Colors.light.text,
      headerTitleStyle: { fontWeight: '700' }
    }}>
      <Stack.Screen name="index" options={{ title: 'Панель Владельца' }} />
      <Stack.Screen name="add-product" options={{ title: 'Новый Товар' }} />
      <Stack.Screen name="edit-product" options={{ title: 'Редактирование' }} />
      <Stack.Screen name="catalog" options={{ title: 'Каталог' }} />
      <Stack.Screen name="orders" options={{ title: 'Заказы Клиентов' }} />
    </Stack>
  );
}

import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/services/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { session } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const checkAccess = async () => {
    if (!session?.user) {
      router.replace('/');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('is_admin, is_picker, is_courier')
      .eq('id', session.user.id)
      .single();

    if (data?.is_admin || data?.is_picker || data?.is_courier) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      router.replace('/');
    }
  };

  if (!hasAccess) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-product" />
      <Stack.Screen name="edit-product" />
      <Stack.Screen name="catalog" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="categories" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});

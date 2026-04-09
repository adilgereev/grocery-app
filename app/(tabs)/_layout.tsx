import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Shadows } from '@/constants/theme';

import { useAuth } from '@/providers/AuthProvider';
import { useCartStore } from '@/store/cartStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const unstable_settings = {
  // Гарантирует, что при открытии рута /(tabs) первой вкладкой всегда будет (index),
  // вне зависимости от алфавитного порядка папок в Expo Router (где (cart) стоит раньше).
  initialRouteName: '(index)',
};

export default function TabLayout() {

  const cartItemsCount = useCartStore((state) => state.totalItems);
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);

  useEffect(() => {
    if (session?.user) {
      fetchFavorites(session.user.id);
    }
  }, [session, fetchFavorites]);

  return (
    <Tabs
      initialRouteName="(index)"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.textLight,
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 65,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
          backgroundColor: Colors.light.card,
          borderTopWidth: 1,
          borderTopColor: Colors.light.borderLight,
          ...Shadows.sm,
        },
      }}>
      <Tabs.Screen
        name="(index)"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(cart)"
        options={{
          title: 'Корзина',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
          tabBarBadge: cartItemsCount > 0 ? cartItemsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.light.primary },
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

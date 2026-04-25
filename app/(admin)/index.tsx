import AdminMenuItem from '@/components/admin/AdminMenuItem';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const router = useRouter();
  const { pendingCount } = useAdminDashboard();
  const { profile } = useAuth();
  const isAdmin = profile?.is_admin;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScreenHeader title="Панель управления" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.menuContainerPrimary}>
          <AdminMenuItem
            icon="cube"
            title="Заказы клиентов"
            subtitle="Смена статуса и сборка заказов"
            badge={pendingCount}
            onPress={() => router.push('/(admin)/orders')}
            testID="admin-orders-button"
          />
        </View>

        {isAdmin && (
          <View style={styles.menuContainer}>
            <AdminMenuItem
              icon="add-circle"
              title="Добавить товар"
              subtitle="Создать новую карточку товара"
              onPress={() => router.push('/(admin)/add-product')}
              testID="admin-add-product-button"
            />
            <View style={styles.divider} />
            <AdminMenuItem
              icon="list"
              title="Товары"
              subtitle="Редактирование и удаление товаров"
              onPress={() => router.push('/(admin)/catalog')}
              testID="admin-catalog-button"
            />
            <View style={styles.divider} />
            <AdminMenuItem
              icon="grid"
              title="Категории"
              subtitle="Добавление и изменение разделов"
              onPress={() => router.push('/(admin)/categories')}
              testID="admin-categories-button"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.m,
  },
  menuContainerPrimary: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  menuContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xs,
    ...Shadows.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 82,
    marginRight: Spacing.m,
  },
});

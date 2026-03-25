import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={styles.headerBlock}>
        <Text style={styles.welcomeText}>Добро пожаловать в Админку!</Text>
        <Text style={styles.subtitle}>Здесь вы можете управлять своим магазином.</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)/add-product')}>
          <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="add-circle" size={24} color="#6366F1" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Добавить товар</Text>
            <Text style={styles.menuSubtitle}>Создать новую карточку товара</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)/catalog')}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="list" size={24} color="#EF4444" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Управление каталогом</Text>
            <Text style={styles.menuSubtitle}>Редактирование и удаление товаров</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)/orders')}>
          <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="cube" size={24} color="#10B981" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Заказы клиентов</Text>
            <Text style={styles.menuSubtitle}>Смена статуса и сборка заказов</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(admin)/categories')}>
          <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="grid" size={24} color="#F97316" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Управление категориями</Text>
            <Text style={styles.menuSubtitle}>Добавление и изменение разделов</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textLight} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: Spacing.m,
  },
  headerBlock: {
    marginBottom: Spacing.l,
    marginTop: Spacing.m,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 82,
    marginRight: Spacing.m,
  }
});

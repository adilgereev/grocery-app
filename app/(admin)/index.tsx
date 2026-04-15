import ScreenHeader from "@/components/ui/ScreenHeader";
import { Colors, Radius, Shadows, Spacing } from "@/constants/theme";
import { fetchPendingOrdersCount } from "@/lib/api/adminApi";
import { supabase } from "@/lib/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const count = await fetchPendingOrdersCount();
      setPendingCount(count);
    } catch {
      // Ошибка загрузки счётчика заказов
    }
  }, []);

  // Обновлять при каждом возврате на экран
  useFocusEffect(
    useCallback(() => {
      loadCount();
    }, [loadCount]),
  );

  useEffect(() => {
    const channel = supabase
      .channel("admin_dashboard_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        loadCount,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCount]);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScreenHeader title="Панель управления" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.menuContainerPrimary}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(admin)/orders")}
            testID="admin-orders-button"
          >
            <View style={styles.menuIcon}>
              <Ionicons name="cube" size={24} color={Colors.light.primary} />
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Заказы клиентов</Text>
              <Text style={styles.menuSubtitle}>
                Смена статуса и сборка заказов
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textLight}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(admin)/add-product")}
          >
            <View style={styles.menuIcon}>
              <Ionicons
                name="add-circle"
                size={24}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Добавить товар</Text>
              <Text style={styles.menuSubtitle}>
                Создать новую карточку товара
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textLight}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(admin)/catalog")}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="list" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Управление каталогом</Text>
              <Text style={styles.menuSubtitle}>
                Редактирование и удаление товаров
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textLight}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(admin)/categories")}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="grid" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Управление категориями</Text>
              <Text style={styles.menuSubtitle}>
                Добавление и изменение разделов
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textLight}
            />
          </TouchableOpacity>
        </View>
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.m,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.m,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.m,
    backgroundColor: Colors.light.primaryLight,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.warning,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.white,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
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
  },
});

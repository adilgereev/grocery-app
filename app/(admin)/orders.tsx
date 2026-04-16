import ScreenHeader from "@/components/ui/ScreenHeader";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import AdminOrdersSkeleton from "@/components/admin/AdminOrdersSkeleton";
import { Colors, Spacing } from "@/constants/theme";
import { AdminOrderWithDetails } from "@/lib/api/adminApi";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import React, { useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageOrdersScreen() {
  const {
    orders,
    loading,
    expandedOrders,
    fetchOrders,
    toggleExpand,
    callCustomer,
    showStatusOptions,
  } = useAdminOrders();

  const renderItem = useCallback(
    ({ item }: { item: AdminOrderWithDetails }) => (
      <AdminOrderCard
        order={item}
        isExpanded={expandedOrders.includes(item.id)}
        onToggleExpand={toggleExpand}
        onCallCustomer={callCustomer}
        onShowStatusOptions={showStatusOptions}
      />
    ),
    [expandedOrders, toggleExpand, callCustomer, showStatusOptions],
  );

  if (loading) {
    return <AdminOrdersSkeleton />;
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScreenHeader title="Заказы клиентов" />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Нет заказов.</Text>}
        refreshing={loading}
        onRefresh={fetchOrders}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m, paddingBottom: 60 },
  empty: {
    textAlign: "center",
    marginTop: 100,
    color: Colors.light.textSecondary,
  },
});

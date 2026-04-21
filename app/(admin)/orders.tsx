import ScreenHeader from "@/components/ui/ScreenHeader";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import AdminOrdersSkeleton from "@/components/admin/AdminOrdersSkeleton";
import AdminReplaceItemModal from "@/components/admin/AdminReplaceItemModal";
import { Colors, Spacing } from "@/constants/theme";
import { AdminOrderWithDetails } from "@/lib/api/adminApi";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageOrdersScreen() {
  const {
    orders,
    loading,
    expandedOrders,
    replaceTarget,
    fetchOrders,
    toggleExpand,
    callCustomer,
    showStatusOptions,
    showItemOptions,
    handleConfirmReplace,
    dismissReplaceTarget,
  } = useAdminOrders();

  const renderItem = useCallback(
    ({ item }: { item: AdminOrderWithDetails }) => (
      <AdminOrderCard
        order={item}
        isExpanded={expandedOrders.includes(item.id)}
        onToggleExpand={toggleExpand}
        onCallCustomer={callCustomer}
        onShowStatusOptions={showStatusOptions}
        onShowItemOptions={showItemOptions}
      />
    ),
    [expandedOrders, toggleExpand, callCustomer, showStatusOptions, showItemOptions],
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
      <AdminReplaceItemModal
        item={replaceTarget?.item ?? null}
        visible={!!replaceTarget}
        onClose={dismissReplaceTarget}
        onSelect={handleConfirmReplace}
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

import ScreenHeader from "@/components/ui/ScreenHeader";
import StaffOrderCard from "@/components/staff/StaffOrderCard";
import AdminOrdersSkeleton from "@/components/admin/AdminOrdersSkeleton";
import AdminReplaceItemModal from "@/components/admin/AdminReplaceItemModal";
import { Colors, FontSize, Radius, Shadows, Spacing } from "@/constants/theme";
import { AdminOrderWithDetails } from "@/lib/api/adminApi";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useAuth } from "@/providers/AuthProvider";
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const { profile } = useAuth();
  const {
    orders, historyOrders, activeTab, setActiveTab,
    loading, expandedOrders, replaceTarget, fetchOrders, fetchHistory,
    toggleExpand, callCustomer, showStatusOptions, showItemOptions,
    handleConfirmReplace, dismissReplaceTarget, showAssignOptions,
    handlePickerTakeOrder, handleCompleteAssembly, handleCourierStartDelivery, handleCompleteDelivery,
  } = useAdminOrders();

  const isAdmin = profile?.is_admin;
  const isPicker = profile?.is_picker;
  const myUserId = profile?.id ?? '';
  const currentData = activeTab === 'active' ? orders : historyOrders;

  const renderItem = useCallback(
    ({ item }: { item: AdminOrderWithDetails }) => {
      if (isAdmin) {
        return (
          <StaffOrderCard
            role="admin"
            order={item}
            isExpanded={expandedOrders.includes(item.id)}
            onToggleExpand={toggleExpand}
            onCallCustomer={callCustomer}
            onShowStatusOptions={showStatusOptions}
            onShowItemOptions={showItemOptions}
            onAssignStaff={showAssignOptions}
          />
        );
      }
      if (isPicker) {
        return (
          <StaffOrderCard
            role="picker"
            order={item}
            isExpanded={expandedOrders.includes(item.id)}
            myUserId={myUserId}
            onToggleExpand={toggleExpand}
            onCallCustomer={callCustomer}
            onShowItemOptions={showItemOptions}
            onPickerTakeOrder={handlePickerTakeOrder}
            onCompleteAssembly={handleCompleteAssembly}
          />
        );
      }
      return (
        <StaffOrderCard
          role="courier"
          order={item}
          myUserId={myUserId}
          onCallCustomer={callCustomer}
          onCourierStartDelivery={handleCourierStartDelivery}
          onCompleteDelivery={handleCompleteDelivery}
        />
      );
    },
    [isAdmin, isPicker, myUserId, expandedOrders, toggleExpand, callCustomer,
      showStatusOptions, showItemOptions, showAssignOptions,
      handlePickerTakeOrder, handleCompleteAssembly, handleCourierStartDelivery, handleCompleteDelivery],
  );

  if (loading) return <AdminOrdersSkeleton />;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScreenHeader title="Заказы клиентов" />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Активные</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>История</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {activeTab === 'active' ? 'Нет активных заказов.' : 'История пуста.'}
          </Text>
        }
        refreshing={loading}
        onRefresh={activeTab === 'active' ? fetchOrders : fetchHistory}
      />
      {(isAdmin || isPicker) && (
        <AdminReplaceItemModal
          item={replaceTarget?.item ?? null}
          visible={!!replaceTarget}
          onClose={dismissReplaceTarget}
          onSelect={handleConfirmReplace}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m, paddingBottom: 60 },
  empty: { textAlign: "center", marginTop: 100, color: Colors.light.textSecondary },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.m,
    marginTop: Spacing.s,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.light.borderLight,
    borderRadius: Radius.pill,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.light.card,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.light.text,
  },
});

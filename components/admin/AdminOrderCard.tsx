import { AdminOrderItem, AdminOrderWithDetails } from "@/lib/api/adminApi";
import { cleanAddress } from "@/lib/utils/addressUtils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/theme";
import { STATUSES } from "@/constants/orderStatuses";
import AdminOrderItems from "./AdminOrderItems";
import { s } from "./AdminOrderCard.styles";

interface Props {
  order: AdminOrderWithDetails;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCallCustomer: (phone: string | null) => void;
  onShowStatusOptions: (orderId: string, currentStatus: string) => void;
  onShowItemOptions: (item: AdminOrderItem, order: AdminOrderWithDetails) => void;
}

export default function AdminOrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onCallCustomer,
  onShowStatusOptions,
  onShowItemOptions,
}: Props) {
  const statusInfo = STATUSES[order.status] || STATUSES.pending;
  const profile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  const customerName = profile?.first_name || "Клиент";

  const date = new Date(order.created_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.orderId}>Заказ #{order.id.split("-")[0]}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
          <Text style={[s.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View style={s.customerInfo}>
        <TouchableOpacity
          style={s.customerRow}
          onPress={() => onCallCustomer(profile?.phone)}
          testID="admin-order-call-btn"
        >
          <Ionicons name="person-circle" size={24} color={Colors.light.textSecondary} />
          <View style={s.customerInfoContainer}>
            <Text style={s.customerName}>{customerName}</Text>
            <Text style={s.customerPhone}>{profile?.phone || "Телефон не указан"}</Text>
          </View>
          <Ionicons name="call" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.addressBox}>
        <Ionicons name="location" size={16} color={Colors.light.textSecondary} />
        <Text style={s.addressText} numberOfLines={2}>
          {cleanAddress(order.delivery_address)}
        </Text>
      </View>

      {order.comment ? (
        <View style={s.commentBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={15} color={Colors.light.textSecondary} />
          <Text style={s.commentText}>{order.comment}</Text>
        </View>
      ) : null}

      <View style={s.footer}>
        <Text style={s.price}>{order.total_amount.toLocaleString("ru")} ₽</Text>
        <Text style={s.date}>{date}</Text>
      </View>

      <TouchableOpacity
        style={s.expandButton}
        onPress={() => onToggleExpand(order.id)}
        testID="admin-order-expand-btn"
      >
        <Text style={s.expandButtonText}>
          {isExpanded ? "Скрыть состав заказа" : `Показать товары (${order.items?.length || 0})`}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.light.primary}
        />
      </TouchableOpacity>

      {isExpanded && order.items && (
        <AdminOrderItems
          items={order.items}
          orderStatus={order.status}
          onItemOptions={(item) => onShowItemOptions(item, order)}
        />
      )}

      <TouchableOpacity
        style={[s.actionButton, { backgroundColor: statusInfo.color }]}
        onPress={() => onShowStatusOptions(order.id, order.status)}
        testID="admin-order-status-btn"
      >
        <Text style={s.actionButtonText}>Изменить статус</Text>
      </TouchableOpacity>
    </View>
  );
}

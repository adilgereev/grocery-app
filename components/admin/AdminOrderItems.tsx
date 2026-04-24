import { AdminOrderItem, AdminOrderWithDetails } from "@/lib/api/adminApi";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";

const EDITABLE_STATUSES = new Set(["pending", "processing"]);

interface Props {
  items: AdminOrderItem[];
  orderStatus: AdminOrderWithDetails["status"];
  onItemOptions: (item: AdminOrderItem) => void;
}

export default function AdminOrderItems({ items, orderStatus, onItemOptions }: Props) {
  const canEdit = EDITABLE_STATUSES.has(orderStatus);

  return (
    <View style={s.container}>
      {items.map((item) => (
        <View key={item.id} style={s.row} testID={`admin-order-item-${item.id}`}>
          <View style={s.info}>
            <Text style={s.name}>
              {item.product?.name ?? "Неизвестный товар"}{" "}
              <Text style={s.qty}>x{item.quantity}</Text>
            </Text>
            <Text style={s.unit}>{item.product?.unit ?? ""}</Text>
          </View>
          <View style={s.right}>
            <Text style={s.price}>
              {(item.price_at_time * item.quantity).toLocaleString("ru")} ₽
            </Text>
            {canEdit && (
              <TouchableOpacity
                style={s.menuBtn}
                onPress={() => onItemOptions(item)}
                testID={`admin-item-options-${item.id}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={16}
                  color={Colors.light.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.s,
  },
  info: { flex: 1, paddingRight: Spacing.s },
  name: { fontSize: FontSize.m, fontWeight: "600", color: Colors.light.text },
  qty: { fontWeight: "700", color: Colors.light.textSecondary },
  unit: { fontSize: FontSize.s, color: Colors.light.textLight, marginTop: 2 },
  right: { flexDirection: "row", alignItems: "center", gap: Spacing.s },
  price: { fontSize: FontSize.m, fontWeight: "700", color: Colors.light.text },
  menuBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.s,
    backgroundColor: Colors.light.borderLight,
  },
});

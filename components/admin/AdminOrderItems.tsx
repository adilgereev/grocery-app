import { AdminOrderItem, AdminOrderWithDetails } from "@/lib/api/adminApi";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Radius, Spacing } from "@/constants/theme";
import { getOptimizedImage } from "@/lib/utils/imageKit";
import Skeleton from "@/components/ui/Skeleton";

const EDITABLE_STATUSES = new Set(["pending", "processing"]);
const THUMB_SIZE = 44;

interface Props {
  items: AdminOrderItem[];
  orderStatus: AdminOrderWithDetails["status"];
  onItemOptions: (item: AdminOrderItem) => void;
}

export default function AdminOrderItems({ items, orderStatus, onItemOptions }: Props) {
  const canEdit = EDITABLE_STATUSES.has(orderStatus);

  return (
    <View style={s.container}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <View style={s.row} testID={`admin-order-item-${item.id}`}>
            {item.product?.image_url ? (
              <Image
                source={{ uri: getOptimizedImage(item.product.image_url, { width: THUMB_SIZE * 2 }) }}
                style={s.thumb}
              />
            ) : (
              <Skeleton width={THUMB_SIZE} height={THUMB_SIZE} borderRadius={Radius.s} />
            )}

            <View style={s.content}>
              <View style={s.topRow}>
                <Text style={s.name} numberOfLines={2}>
                  {item.product?.name ?? "Неизвестный товар"}
                </Text>
                {canEdit && (
                  <TouchableOpacity
                    style={s.menuBtn}
                    onPress={() => onItemOptions(item)}
                    testID={`admin-item-options-${item.id}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={s.metaRow}>
                <View style={s.qtyPill}>
                  <Text style={s.qtyPillText}>×{item.quantity}</Text>
                </View>
                <Text style={s.unitPrice}>
                  {item.price_at_time.toLocaleString("ru")} ₽
                  {item.product?.unit ? `/${item.product.unit}` : ""}
                </Text>
                <View style={s.spacer} />
                <Text style={s.totalPrice}>
                  {(item.price_at_time * item.quantity).toLocaleString("ru")} ₽
                </Text>
              </View>
            </View>
          </View>

          {index < items.length - 1 && <View style={s.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    marginBottom: Spacing.m,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.s,
    backgroundColor: Colors.light.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: FontSize.m,
    fontWeight: "600",
    color: Colors.light.text,
    marginRight: Spacing.xs,
  },
  menuBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.s,
    backgroundColor: Colors.light.borderLight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  qtyPill: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s,
    paddingVertical: 2,
  },
  qtyPillText: {
    fontSize: FontSize.s,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  unitPrice: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
  },
  spacer: { flex: 1 },
  totalPrice: {
    fontSize: FontSize.m,
    fontWeight: "700",
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginHorizontal: 0,
  },
});

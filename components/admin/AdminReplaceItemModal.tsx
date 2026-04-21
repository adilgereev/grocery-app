import {
  AdminOrderItem,
  ReplacementSuggestion,
  fetchReplacementSuggestions,
} from "@/lib/api/adminApi";
import { Colors, FontSize, Radius, Shadows, Spacing } from "@/constants/theme";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  item: AdminOrderItem | null;
  visible: boolean;
  onClose: () => void;
  onSelect: (replacement: ReplacementSuggestion) => Promise<void>;
}

function PriceDelta({ original, current }: { original: number; current: number }) {
  const delta = current - original;
  if (delta === 0) return null;
  const label =
    delta > 0
      ? `+${delta.toLocaleString("ru")} ₽`
      : `${delta.toLocaleString("ru")} ₽`;
  return (
    <Text style={[s.delta, { color: delta > 0 ? Colors.light.warning : Colors.light.success }]}>
      {label}
    </Text>
  );
}

export default function AdminReplaceItemModal({ item, visible, onClose, onSelect }: Props) {
  const [suggestions, setSuggestions] = useState<ReplacementSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSuggestions = useCallback(async () => {
    if (!item?.product?.category_id) return;
    setLoading(true);
    try {
      const data = await fetchReplacementSuggestions(
        item.product.category_id,
        item.product.id,
        item.price_at_time,
      );
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [item]);

  useEffect(() => {
    if (visible) loadSuggestions();
    else setSuggestions([]);
  }, [visible, loadSuggestions]);

  async function handleSelect(replacement: ReplacementSuggestion) {
    setSubmitting(true);
    try {
      await onSelect(replacement);
    } finally {
      setSubmitting(false);
    }
  }

  const noCategoryId = !!item && !item.product?.category_id;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <View style={s.header}>
          <Text style={s.title}>
            Заменить «{item?.product?.name ?? "—"}»
          </Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} testID="replace-modal-close">
            <Text style={s.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>

        {noCategoryId && (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Категория товара не указана — замена недоступна</Text>
          </View>
        )}

        {loading && (
          <View style={s.emptyBox}>
            <ActivityIndicator color={Colors.light.primary} />
          </View>
        )}

        {!loading && !noCategoryId && suggestions.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Нет похожих товаров в этой категории</Text>
          </View>
        )}

        {!loading && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(s) => s.id}
            contentContainerStyle={s.list}
            renderItem={({ item: suggestion }) => (
              <View style={s.card}>
                <View style={s.cardInfo}>
                  <Text style={s.cardName}>{suggestion.name}</Text>
                  <View style={s.priceRow}>
                    <Text style={s.cardPrice}>
                      {suggestion.price.toLocaleString("ru")} ₽ / {suggestion.unit}
                    </Text>
                    {item && (
                      <PriceDelta original={item.price_at_time} current={suggestion.price} />
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[s.selectBtn, submitting && s.selectBtnDisabled]}
                  disabled={submitting}
                  onPress={() => handleSelect(suggestion)}
                  testID={`replace-select-${suggestion.id}`}
                >
                  <Text style={s.selectBtnText}>Выбрать</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  title: { fontSize: FontSize.m, fontWeight: "700", color: Colors.light.text, flex: 1 },
  closeBtn: { paddingLeft: Spacing.m },
  closeText: { fontSize: FontSize.s, color: Colors.light.primary, fontWeight: "600" },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  emptyText: { fontSize: FontSize.s, color: Colors.light.textSecondary, textAlign: "center" },
  list: { padding: Spacing.m, gap: Spacing.s },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    ...Shadows.sm,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: FontSize.s, fontWeight: "600", color: Colors.light.text },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  cardPrice: { fontSize: FontSize.xs, color: Colors.light.textSecondary },
  delta: { fontSize: FontSize.xs, fontWeight: "600" },
  selectBtn: {
    backgroundColor: Colors.light.cta,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: Radius.pill,
  },
  selectBtnDisabled: { opacity: 0.5 },
  selectBtnText: { color: Colors.light.white, fontSize: FontSize.s, fontWeight: "700" },
});

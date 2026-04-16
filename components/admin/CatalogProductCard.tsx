import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { ProductWithCategory } from '@/types';

interface Props {
  product: ProductWithCategory;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (id: string, currentValue: boolean) => void;
}

export function CatalogProductCard({ product, onEdit, onDelete, onToggleActive }: Props) {
  const handleEdit = useCallback(() => onEdit(product.id), [product.id, onEdit]);
  const handleDelete = useCallback(() => onDelete(product.id, product.name), [product.id, product.name, onDelete]);
  const handleToggle = useCallback(() => onToggleActive(product.id, product.is_active), [product.id, product.is_active, onToggleActive]);

  return (
    <View style={[styles.card, !product.is_active && styles.inactiveCard]}>
      <View style={styles.infoRow}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.category}>{product.category?.name || 'Без категории'}</Text>
          <Text style={styles.price}>{product.price} ₽ {product.unit ? `/ ${product.unit}` : ''}</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
          <Ionicons name="pencil" size={18} color={Colors.light.primary} />
          <Text style={styles.editText}>Изменить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleToggle}
          testID={`toggle-active-${product.id}`}
        >
          <Ionicons
            name={product.is_active ? 'eye' : 'eye-off'}
            size={18}
            color={product.is_active ? Colors.light.primary : Colors.light.textLight}
          />
          <Text style={[styles.editText, !product.is_active && styles.hiddenText]}>
            {product.is_active ? 'Скрыть' : 'Показать'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Ionicons name="trash" size={18} color={Colors.light.error} />
          <Text style={styles.deleteText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  inactiveCard: { opacity: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m },
  image: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m },
  textContainer: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.light.text, marginBottom: 4 },
  category: { fontSize: 13, color: Colors.light.textSecondary, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: Colors.light.primary },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.light.borderLight, paddingTop: Spacing.s },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.s },
  editText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.primary },
  hiddenText: { color: Colors.light.textLight },
  deleteText: { fontSize: 14, fontWeight: '600', marginLeft: 6, color: Colors.light.error },
  placeholderImage: { width: 60, height: 60, borderRadius: Radius.m, marginRight: Spacing.m, backgroundColor: Colors.light.border },
});

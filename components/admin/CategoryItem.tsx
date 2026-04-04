import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { Category } from '@/types';

interface CategoryItemProps {
  item: Category;
  parentCategory?: Category;
  onMove: (category: Category, direction: 'up' | 'down') => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
}

/**
 * Элемент списка категорий в админ-панели.
 * Вынесен из app/(admin)/categories.tsx для декомпозиции.
 */
export default function CategoryItem({ 
  item, 
  parentCategory, 
  onMove, 
  onEdit, 
  onDelete 
}: CategoryItemProps) {
  const isHex = item.image_url?.startsWith('#');
  const isSubcategory = !!item.parent_id;

  return (
    <View style={[styles.card, isSubcategory && styles.subcategoryCard]} testID={`category-item-${item.id}`}>
      <View style={styles.infoRow}>
        {isSubcategory && (
          <Ionicons 
            name="return-down-forward" 
            size={20} 
            color={Colors.light.textLight} 
            style={styles.hierarchyIcon} 
          />
        )}
        
        {isHex ? (
          <View style={[styles.imagePreview, { backgroundColor: item.image_url || undefined }]} />
        ) : item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagePreview} />
        ) : (
          <View style={[styles.imagePreview, { backgroundColor: Colors.light.border }]} />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
          {isSubcategory && parentCategory && (
            <Text style={styles.parentBadge}>← {parentCategory.name}</Text>
          )}
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => onMove(item, 'up')}
            activeOpacity={0.7}
            testID={`move-up-${item.id}`}
          >
            <Ionicons name="chevron-up" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => onMove(item, 'down')}
            activeOpacity={0.7}
            testID={`move-down-${item.id}`}
          >
            <Ionicons name="chevron-down" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onEdit(item)}
          activeOpacity={0.6}
          testID={`edit-btn-${item.id}`}
        >
          <Ionicons name="pencil" size={18} color={Colors.light.primary} />
          <Text style={styles.editText}>Изменить</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onDelete(item.id, item.name)}
          activeOpacity={0.6}
          testID={`delete-btn-${item.id}`}
        >
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
  subcategoryCard: {
    marginLeft: Spacing.xl,
    marginRight: 0,
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: Spacing.m 
  },
  hierarchyIcon: { 
    marginRight: Spacing.s 
  },
  imagePreview: { 
    width: 50, 
    height: 50, 
    borderRadius: Radius.m, 
    marginRight: Spacing.m 
  },
  textContainer: { 
    flex: 1 
  },
  catName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: Colors.light.text 
  },
  parentBadge: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.s,
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.borderLight,
  },
  orderBtn: {
    padding: 4,
  },
  actionsRow: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: Colors.light.borderLight, 
    paddingTop: Spacing.s 
  },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: Spacing.s 
  },
  editText: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 6, 
    color: Colors.light.primary 
  },
  deleteText: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 6, 
    color: Colors.light.error 
  },
});

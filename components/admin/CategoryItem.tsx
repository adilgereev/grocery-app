import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { Category } from '@/types';
import { styles } from './CategoryItem.styles';

interface CategoryItemProps {
  item: Category;
  parentCategory?: Category;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onMove: (category: Category, direction: 'up' | 'down') => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
  onToggleVisibility: (category: Category) => void;
}

/**
 * Элемент списка категорий в админ-панели (мобильное приложение).
 * Декомпозирован: стили вынесены в CategoryItem.styles.ts.
 */
export default function CategoryItem({
  item,
  parentCategory,
  isCollapsed,
  onToggleCollapse,
  onMove,
  onEdit,
  onDelete,
  onToggleVisibility,
}: CategoryItemProps) {
  const isHex = item.image_url?.startsWith('#');
  const isSubcategory = !!item.parent_id;
  const isParent = !isSubcategory;

  return (
    <View style={[styles.card, isSubcategory && styles.subcategoryCard, !item.is_active && styles.inactiveCard]} testID={`category-item-${item.id}`}>
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

        {/* Кнопка collapse только для родительских категорий */}
        {isParent && onToggleCollapse && (
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={onToggleCollapse}
            activeOpacity={0.7}
            testID={`collapse-btn-${item.id}`}
          >
            <Ionicons
              name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        )}

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
          onPress={() => onToggleVisibility(item)}
          activeOpacity={0.6}
          testID={`toggle-visibility-${item.id}`}
        >
          <Ionicons
            name={item.is_active ? 'eye' : 'eye-off'}
            size={18}
            color={item.is_active ? Colors.light.primary : Colors.light.textLight}
          />
          <Text style={[styles.editText, !item.is_active && styles.hiddenText]}>
            {item.is_active ? 'Скрыть' : 'Показать'}
          </Text>
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

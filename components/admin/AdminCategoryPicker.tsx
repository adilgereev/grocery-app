import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface AdminCategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  visible: boolean;
  onClose: () => void;
}

export default function AdminCategoryPicker({ categories, selectedId, onSelect, visible, onClose }: AdminCategoryPickerProps) {
  // Находим только родительские
  const parentCategories = categories.filter(c => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Выберите категорию</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {parentCategories.map(parent => {
            const children = categories.filter(c => c.parent_id === parent.id).sort((a, b) => a.name.localeCompare(b.name));
            
            return (
              <View key={parent.id} style={styles.section}>
                {/* Родительская категория (заголовок) */}
                <TouchableOpacity 
                  style={[styles.parentRow, selectedId === parent.id && styles.selectedRow]}
                  onPress={() => { onSelect(parent.id); onClose(); }}
                >
                  <Text style={[styles.parentName, selectedId === parent.id && styles.selectedText]}>{parent.name}</Text>
                  {selectedId === parent.id && <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />}
                </TouchableOpacity>

                {/* Дочерние категории */}
                {children.map(child => (
                  <TouchableOpacity 
                    key={child.id}
                    style={[styles.childRow, selectedId === child.id && styles.selectedRow]}
                    onPress={() => { onSelect(child.id); onClose(); }}
                  >
                    <Ionicons name="return-down-forward" size={16} color={Colors.light.textLight} style={styles.childIcon} />
                    <Text style={[styles.childName, selectedId === child.id && styles.selectedText]}>{child.name}</Text>
                    {selectedId === child.id && <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          {parentCategories.length === 0 && (
            <Text style={styles.emptyText}>Категории не найдены</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.card },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.m, borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  closeBtn: { padding: 4 },
  scrollContent: { paddingBottom: 40 },
  section: { borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight },
  parentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.m, backgroundColor: Colors.light.card
  },
  parentName: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  childRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.m, paddingRight: Spacing.m, paddingLeft: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.light.borderLight,
    backgroundColor: Colors.light.card
  },
  childIcon: { marginRight: Spacing.s },
  childName: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.light.text },
  selectedRow: { backgroundColor: Colors.light.primaryLight },
  selectedText: { color: Colors.light.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: Colors.light.textSecondary }
});

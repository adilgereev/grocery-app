import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddressStore } from '@/store/addressStore';
import { Address } from '@/types';
import { formatFullAddress } from '@/utils/addressFormatter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, Radius, Shadows } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function AddressesScreen() {
  const { addresses, selectedAddressId, selectAddress } = useAddressStore();
  const router = useRouter();

  // Используем централизованное форматирование
  const displayAddress = (item: Address) => formatFullAddress(item);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Мои адреса" />

      <FlatList
        data={addresses}
        ListHeaderComponent={
          addresses.length > 0 ? (
            <Text style={styles.cityHint}>Доставка по г. Буйнакск</Text>
          ) : null
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listGrow}
        renderItem={({ item }) => (
          <TouchableOpacity 
            testID={`address-card-${item.id}`}
            style={[styles.addressCard, selectedAddressId === item.id && styles.selectedCard]}
            onPress={async () => {
              await selectAddress(item.id);
              router.back();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.addressInfo}>
              {/* Кастомная радио-кнопка в стиле Emerald */}
              <View style={[
                styles.radioOuter,
                selectedAddressId === item.id && styles.radioOuterSelected
              ]}>
                {selectedAddressId === item.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.addressTextWrapper}>
                <Text style={[styles.addressText, selectedAddressId === item.id && styles.selectedAddressText]}>
                  {displayAddress(item)}
                </Text>
              </View>
            </View>
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation(); // Предотвращаем срабатывание выбора адреса при клике на карандаш
                  router.push(`/manage-address?id=${item.id}`);
                }} 
                style={styles.actionBtn}
                testID={`address-edit-btn-${item.id}`}
              >
                <Ionicons name="pencil-outline" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={Colors.light.icon} />
            <Text style={styles.emptyText}>У вас пока нет сохраненных адресов. Добавьте первый!</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          testID="address-add-button"
          style={styles.addButton} 
          onPress={() => router.push('/manage-address')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={Colors.light.card} style={styles.addIcon} />
          <Text style={styles.addButtonText}>Добавить новый адрес</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listGrow: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    padding: Spacing.l,
    borderRadius: Radius.l,
    marginBottom: Spacing.m,
    borderWidth: 1.5,
    borderColor: Colors.light.card,

    // Премиальные тени
    ...Shadows.md,
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.successLight,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTextWrapper: { flex: 1, marginLeft: 16 },
  // Стили кастомной радио-кнопки
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  addressText: {
    fontSize: FontSize.l,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 24,
  },
  selectedAddressText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: Spacing.s,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    marginLeft: Spacing.s,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.l,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: FontSize.l,
    marginTop: Spacing.m,
    lineHeight: 24,
  },
  cityHint: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    paddingLeft: Spacing.xs,
  },
  footer: {
    padding: Spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.l,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  addIcon: { marginRight: Spacing.s },
  addButtonText: {
    color: Colors.light.card,
    fontSize: FontSize.l,
    fontWeight: '700',
  },
});

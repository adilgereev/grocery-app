import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddressStore, Address } from '@/store/addressStore';
import { formatFullAddress } from '@/utils/addressFormatter';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function AddressesScreen() {
  const { addresses, selectedAddressId, removeAddress, selectAddress } = useAddressStore();
  const router = useRouter();

  // Используем централизованное форматирование
  const displayAddress = (item: Address) => formatFullAddress(item);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Мои адреса</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={addresses}
        ListHeaderComponent={
          addresses.length > 0 ? (
            <Text style={styles.cityHint}>Доставка по г. Буйнакск</Text>
          ) : null
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { flexGrow: 1 }]}
        renderItem={({ item }) => (
          <TouchableOpacity 
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
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.addressText, selectedAddressId === item.id && styles.selectedAddressText]}>
                  {displayAddress(item)}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  "Удалить адрес",
                  "Вы уверены, что хотите безвозвратно удалить этот адрес доставки?",
                  [
                    { text: "Отмена", style: "cancel" },
                    { text: "Удалить", style: "destructive", onPress: () => removeAddress(item.id) }
                  ]
                );
              }} 
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
            </TouchableOpacity>
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
          style={styles.addButton} 
          onPress={() => router.push('/add-address')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#fff" style={{ marginRight: Spacing.s }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  list: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: Spacing.l,
    borderRadius: Radius.l,
    marginBottom: Spacing.m,
    borderWidth: 1.5,
    borderColor: 'transparent',

    // Премиальные тени
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0FDF4', // Мягкий зеленый фон
    shadowOpacity: 0.08, // Чуть сильнее тень при выборе
    shadowColor: Colors.light.primary,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // Стили кастомной радио-кнопки
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  deleteBtn: {
    padding: Spacing.s,
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
    backgroundColor: '#fff',
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
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: FontSize.l,
    fontWeight: 'bold',
  },
});

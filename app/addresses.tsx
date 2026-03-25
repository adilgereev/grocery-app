import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddressStore, Address } from '@/store/addressStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function AddressesScreen() {
  const { addresses, selectedAddressId, removeAddress, selectAddress } = useAddressStore();
  const router = useRouter();

  const renderAddressText = (item: Address) => {
    // Убираем город из основной строки для отображения
    const cleanAddress = item.text.replace(/^г\. Буйнакск, /, '');
    
    const parts = [cleanAddress];
    if (item.house) parts.push(`д. ${item.house}`);
    if (item.entrance) parts.push(`под. ${item.entrance}`);
    if (item.floor) parts.push(`эт. ${item.floor}`);
    if (item.apartment) parts.push(`кв. ${item.apartment}`);
    
    return {
      main: parts.join(', '),
      city: item.text.includes('г. Буйнакск') ? 'г. Буйнакск' : ''
    };
  };

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
              <Ionicons 
                name={selectedAddressId === item.id ? "radio-button-on" : "radio-button-off"} 
                size={24} 
                color={selectedAddressId === item.id ? Colors.light.primary : Colors.light.icon} 
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.addressText, selectedAddressId === item.id && styles.selectedAddressText]}>
                  {renderAddressText(item).main}
                </Text>
                {renderAddressText(item).city ? (
                  <Text style={styles.citySubtext}>
                    {renderAddressText(item).city}
                  </Text>
                ) : null}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 18,
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
    padding: Spacing.m,
    borderRadius: Radius.l,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  selectedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  citySubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  selectedAddressText: {
    color: '#065F46',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: Spacing.s,
    marginLeft: Spacing.s,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 16,
    marginTop: Spacing.m,
    lineHeight: 24,
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
    fontSize: 17,
    fontWeight: 'bold',
  },
});

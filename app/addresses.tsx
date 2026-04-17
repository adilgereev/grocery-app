import React from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddresses } from '@/hooks/useAddresses';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressEmptyState } from '@/components/address/AddressEmptyState';
import { AddressFooter } from '@/components/address/AddressFooter';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function AddressesScreen() {
  const { addresses, selectedAddressId, selectAddress, router, formatDetails } = useAddresses();

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
        renderItem={({ item, index }) => (
          <AddressCard
            item={item}
            index={index}
            isSelected={selectedAddressId === item.id}
            onSelect={async (id) => {
              await selectAddress(id);
              router.back();
            }}
            onEdit={(id) => router.push(`/manage-address?id=${id}`)}
            formatDetails={formatDetails}
          />
        )}
        ListEmptyComponent={<AddressEmptyState />}
      />

      <AddressFooter onAdd={() => router.push('/manage-address')} />
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
  cityHint: {
    fontSize: FontSize.s,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    paddingLeft: Spacing.xs,
  },
});

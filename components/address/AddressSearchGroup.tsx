import AddressSearchInput from '@/components/address/AddressSearchInput';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAddressSearch } from './useAddressSearch';

interface AddressSearchGroupProps {
  address: string;
  error?: string;
  onAddressChange: (text: string) => void;
  onHouseChange: (house: string) => void;
  onCoordsChange: (lat: number, lon: number) => void;
}

export const AddressSearchGroup: React.FC<AddressSearchGroupProps> = ({
  address,
  error,
  onAddressChange,
  onHouseChange,
  onCoordsChange,
}) => {
  const { handleTextChange, handleSelect } = useAddressSearch({
    onAddressChange,
    onHouseChange,
    onCoordsChange,
  });

  return (
    <View style={styles.searchGroup}>
      <View style={styles.labelWithIcon}>
        <Ionicons name="location-sharp" size={16} color={Colors.light.primary} />
        <Text style={styles.fieldLabel}>Адрес доставки</Text>
      </View>
      <AddressSearchInput
        city="Буйнакск"
        initialValue={address}
        onChangeText={handleTextChange}
        onSelect={handleSelect}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  searchGroup: {
    marginBottom: Spacing.s,
    zIndex: 99,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.s,
  },
  fieldLabel: {
    fontSize: FontSize.s,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: FontSize.s,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
});

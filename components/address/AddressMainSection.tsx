import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AddressSearchGroup } from './AddressSearchGroup';
import { MapSelectButton } from './MapSelectButton';
import { PrivateHouseToggle } from './PrivateHouseToggle';

interface AddressMainSectionProps {
  address: string;
  isPrivateHouse: boolean;
  onAddressChange: (text: string) => void;
  onHouseChange: (house: string) => void;
  onCoordsChange: (lat: number, lon: number) => void;
  onTogglePrivateHouse: (value: boolean) => void;
  onOpenMap: () => void;
  error?: string;
}

/**
 * Основная секция ввода адреса: поиск, переход к карте и переключатель типа дома
 */
export const AddressMainSection: React.FC<AddressMainSectionProps> = ({
  address,
  isPrivateHouse,
  onAddressChange,
  onHouseChange,
  onCoordsChange,
  onTogglePrivateHouse,
  onOpenMap,
  error,
}) => {
  return (
    <View style={styles.card}>
      {/* Поле поиска адреса */}
      <AddressSearchGroup
        address={address}
        error={error}
        onAddressChange={onAddressChange}
        onHouseChange={onHouseChange}
        onCoordsChange={onCoordsChange}
      />

      {/* Кнопка выбора на карте */}
      <MapSelectButton onPress={onOpenMap} />

      {/* Разделитель */}
      <View style={styles.divider} />

      {/* Переключатель типа дома */}
      <PrivateHouseToggle
        isPrivateHouse={isPrivateHouse}
        onToggle={onTogglePrivateHouse}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    zIndex: 10,
    ...Shadows.md,
  },
  // Разделитель
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.m,
  },
});

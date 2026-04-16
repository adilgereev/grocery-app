import AddressSearchInput from '@/components/address/AddressSearchInput';
import { Colors, FontSize, Radius, Spacing, Shadows } from '@/constants/theme';
import { formatAddressString } from '@/lib/utils/addressUtils';
import { DaDataSuggestion } from '@/lib/api/dadataApi';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <View style={styles.searchGroup}>
        <View style={styles.labelWithIcon}>
          <Ionicons name="location-sharp" size={16} color={Colors.light.primary} />
          <Text style={styles.fieldLabel}>Адрес доставки</Text>
        </View>
        <AddressSearchInput
          city="Буйнакск"
          initialValue={address}
          onChangeText={(text) => {
            onAddressChange(text);
            onHouseChange(''); // Сбрасываем выбранный дом при ручном вводе
          }}
          onSelect={(suggestion: DaDataSuggestion) => {
            const formatted = formatAddressString(suggestion);
            onAddressChange(formatted);
            if (suggestion.data.geo_lat && suggestion.data.geo_lon) {
              onCoordsChange(
                parseFloat(suggestion.data.geo_lat),
                parseFloat(suggestion.data.geo_lon)
              );
            }
            if (suggestion.data.house) {
              onHouseChange(suggestion.data.house);
            } else {
              onHouseChange('');
            }
            Haptics.selectionAsync();
          }}
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Кнопка выбора на карте */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpenMap();
        }}
        style={styles.mapButton}
        activeOpacity={0.7}
      >
        <Ionicons name="map-outline" size={18} color={Colors.light.primary} />
        <Text style={styles.mapButtonText}>Выбрать на карте</Text>
      </TouchableOpacity>

      {/* Разделитель */}
      <View style={styles.divider} />

      {/* Переключатель типа дома */}
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onTogglePrivateHouse(!isPrivateHouse);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <View style={[styles.toggleIconCircle, isPrivateHouse && styles.toggleIconCircleActive]}>
            <Ionicons
              name={isPrivateHouse ? 'home' : 'business'}
              size={18}
              color={isPrivateHouse ? Colors.light.primary : Colors.light.icon}
            />
          </View>
          <Text style={styles.toggleLabel}>Частный дом</Text>
        </View>
        <View style={[styles.switchBase, isPrivateHouse && styles.switchActive]}>
          <View style={[styles.switchThumb, isPrivateHouse && styles.switchThumbActive]} />
        </View>
      </TouchableOpacity>
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

  // Поиск
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

  // Кнопка карты
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.l,
    height: 44,
    marginTop: Spacing.s,
  },
  mapButtonText: {
    fontSize: FontSize.m,
    color: Colors.light.primary,
    fontWeight: '700',
  },

  // Разделитель
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.m,
  },

  // Переключатель
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIconCircleActive: {
    backgroundColor: Colors.light.primaryLight,
  },
  toggleLabel: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.text,
  },
  switchBase: {
    width: 46,
    height: 26,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.border,
    padding: 3,
  },
  switchActive: { backgroundColor: Colors.light.primary },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.card,
    ...Shadows.sm,
  },
  switchThumbActive: { alignSelf: 'flex-end' },
});

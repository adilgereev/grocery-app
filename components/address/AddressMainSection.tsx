import AddressSearchInput from '@/components/address/AddressSearchInput';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
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
    <View style={styles.cardWithZIndex}>
      <View style={styles.fieldGroupWithZIndex}>
        <View style={styles.labelRow}>
          <View style={styles.labelWithIcon}>
            <Ionicons name="location-sharp" size={18} color={Colors.light.primary} />
            <Text style={styles.fieldLabel}>Адрес доставки*</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onOpenMap();
            }}
            style={styles.mapLink}
          >
            <Ionicons name="map" size={16} color={Colors.light.primary} />
            <Text style={styles.mapLinkText}>На карте</Text>
          </TouchableOpacity>
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
          <Text style={styles.errorTextInline}>{error}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.toggleRowCompact}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onTogglePrivateHouse(!isPrivateHouse);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.toggleTextContainer}>
          <Ionicons
            name={isPrivateHouse ? "home" : "business"}
            size={20}
            color={isPrivateHouse ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text style={styles.toggleLabel}>Частный дом</Text>
        </View>
        <View style={[styles.switchBase, isPrivateHouse && styles.switchActive]}>
          <View
            style={[styles.switchThumb, isPrivateHouse && styles.switchThumbActive]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWithZIndex: {
    borderRadius: Radius.xl,
    marginBottom: Spacing.l,
    zIndex: 10,
  },
  fieldGroupWithZIndex: { marginBottom: Spacing.s, zIndex: 99 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.s },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.m,
  },
  mapLinkText: { fontSize: 13, color: Colors.light.primary, fontWeight: '700' },
  errorTextInline: { color: Colors.light.error, fontSize: 12, marginTop: 4, fontWeight: '500' },
  toggleRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.s,
  },
  toggleTextContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: Colors.light.text },
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

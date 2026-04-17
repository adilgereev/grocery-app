import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/types';
import { formatShortAddress } from '@/lib/utils/addressFormatter';
import { Colors, FontSize, Spacing, Radius, Shadows, Duration } from '@/constants/theme';

interface AddressCardProps {
  item: Address;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  formatDetails: (item: Address) => string;
}

export function AddressCard({
  item,
  index,
  isSelected,
  onSelect,
  onEdit,
  formatDetails,
}: AddressCardProps) {
  const details = formatDetails(item);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(Duration.default)}
      layout={LinearTransition.springify()}
    >
      <TouchableOpacity
        testID={`address-card-${item.id}`}
        style={[styles.addressCard, isSelected && styles.selectedCard]}
        onPress={() => onSelect(item.id).then(() => undefined)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
          <Ionicons
            name="location-sharp"
            size={22}
            color={isSelected ? Colors.light.primary : Colors.light.icon}
          />
        </View>

        <View style={styles.addressInfo}>
          <Text style={[styles.addressStreet, isSelected && styles.addressStreetSelected]} numberOfLines={2}>
            {formatShortAddress(item)}
          </Text>
          {details ? (
            <Text style={styles.addressDetails} numberOfLines={1}>
              {details}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onEdit(item.id);
          }}
          style={styles.editBtn}
          testID={`address-edit-btn-${item.id}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={20} color={Colors.light.icon} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: Spacing.m,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.m,
    borderWidth: 1.5,
    borderColor: Colors.light.card,
    ...Shadows.md,
  },
  selectedCard: {
    borderColor: Colors.light.primaryBorder,
    backgroundColor: Colors.light.primaryLight,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: Colors.light.primaryLight,
  },

  addressInfo: {
    flex: 1,
  },
  addressStreet: {
    fontSize: FontSize.m,
    color: Colors.light.text,
    fontWeight: '600',
    lineHeight: 22,
  },
  addressStreetSelected: {
    color: Colors.light.primaryDark,
    fontWeight: '700',
  },
  addressDetails: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  editBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.s,
  },
});

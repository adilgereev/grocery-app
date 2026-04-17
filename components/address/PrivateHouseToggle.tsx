import { Colors, FontSize, Radius, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrivateHouseToggleProps {
  isPrivateHouse: boolean;
  onToggle: (value: boolean) => void;
}

export const PrivateHouseToggle: React.FC<PrivateHouseToggleProps> = ({
  isPrivateHouse,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={styles.toggleRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle(!isPrivateHouse);
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
  );
};

const styles = StyleSheet.create({
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

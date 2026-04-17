import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MapSelectButtonProps {
  onPress: () => void;
}

export const MapSelectButton: React.FC<MapSelectButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.mapButton}
      activeOpacity={0.7}
    >
      <Ionicons name="map-outline" size={18} color={Colors.light.primary} />
      <Text style={styles.mapButtonText}>Выбрать на карте</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

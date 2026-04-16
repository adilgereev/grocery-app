import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface MapPickerProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onClose: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapPicker({ onLocationSelect, onClose, initialLocation }: MapPickerProps) {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 42.8228,
    longitude: initialLocation?.longitude || 47.1167,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const handleConfirm = () => {
    onLocationSelect(region.latitude, region.longitude);
    onClose();
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker coordinate={region} />
      </MapView>

      {/* Шапка модалки */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Укажите точку на карте</Text>
      </View>

      {/* Маркер в центре (визуальный) */}
      <View style={styles.markerContainer} pointerEvents="none">
        <Ionicons name="location" size={40} color={Colors.light.primary} />
      </View>

      {/* Футер с кнопкой */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Выбрать это место</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.card },
  map: { width, height },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30 + (Platform.OS === 'android' ? 10 : 0),
    left: 20, right: 20,
    backgroundColor: Colors.light.card, padding: 15, borderRadius: Radius.m,
    flexDirection: 'row', alignItems: 'center',
    ...Shadows.md,
  },
  closeButton: { marginRight: 15 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
  markerContainer: {
    position: 'absolute', top: height / 2 - 40, left: width / 2 - 20,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary, height: 56, borderRadius: Radius.l,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  confirmButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows } from '@/constants/theme';

interface MapPickerProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onClose: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapPicker({ onLocationSelect, onClose, initialLocation }: MapPickerProps) {
  const handleConfirm = () => {
    // В вебе пока возвращаем статические координаты для заглушки
    onLocationSelect(initialLocation?.latitude || 42.8228, initialLocation?.longitude || 47.1167);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapFallback}>
        <Ionicons name="map-outline" size={64} color={Colors.light.text + '50'} />
        <Text style={styles.fallbackText}>Выбор точки на карте недоступен в Web</Text>
      </View>

      {/* Шапка модалки */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Укажите точку на карте</Text>
      </View>

      {/* Футер с кнопкой */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Выбрать это место (по-умолчанию)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.card },
  mapFallback: { flex: 1, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { marginTop: 10, color: Colors.light.text, fontSize: 16 },
  header: {
    position: 'absolute',
    top: 30,
    left: 20, right: 20,
    backgroundColor: Colors.light.card, padding: 15, borderRadius: Radius.m,
    flexDirection: 'row', alignItems: 'center',
    ...Shadows.md,
  },
  closeButton: { marginRight: 15 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.light.text },
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

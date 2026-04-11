import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Colors, Radius, Spacing, FontSize, Duration } from '@/constants/theme';

interface UndoToastProps {
  productName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

/**
 * Снэкбар с возможностью отмены удаления товара из корзины.
 * Появляется снизу при нажатии минус на товаре с qty=1.
 */
export default function UndoToast({ productName, onUndo, onDismiss }: UndoToastProps) {
  return (
    <Animated.View
      entering={SlideInDown.duration(Duration.default)}
      exiting={SlideOutDown.duration(Duration.default)}
      style={styles.container}
    >
      <Text style={styles.message} numberOfLines={1}>
        «{productName}» удалён
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onUndo}
          style={styles.undoButton}
          activeOpacity={0.7}
          testID="undo-toast-undo"
        >
          <Text style={styles.undoText}>Вернуть</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          activeOpacity={0.7}
          testID="undo-toast-dismiss"
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 76,
    left: Spacing.m,
    right: Spacing.m,
    zIndex: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.text,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  message: {
    flex: 1,
    fontSize: FontSize.s,
    fontWeight: '500',
    color: Colors.light.white,
    marginRight: Spacing.s,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  undoButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill,
  },
  undoText: {
    fontSize: FontSize.s,
    fontWeight: '700',
    color: Colors.light.white,
  },
  dismissButton: {
    padding: Spacing.xs,
  },
  dismissText: {
    fontSize: FontSize.s,
    color: Colors.light.textLight,
  },
});

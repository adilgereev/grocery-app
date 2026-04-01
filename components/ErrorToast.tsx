import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

// Тип уведомления (используется только внутри компонента)
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export function ErrorToast({ type, message, duration = 3000, onDismiss }: ToastProps) {
  // Статичный отступ вместо useSafeAreaInsets (который нельзя вызывать вне компонента)
  const bottomInset = Platform.OS === 'ios' ? 34 : 16;
  const translateY = useRef(new Animated.Value(100));
  const opacity = useRef(new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity.current, { toValue: 0, duration: 250, useNativeDriver: false }),
      Animated.timing(translateY.current, { toValue: 100, duration: 250, useNativeDriver: false })
    ]).start(() => {
      onDismiss?.();
    });
  }, [onDismiss]);

  const showToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity.current, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(translateY.current, { toValue: 0, duration: 300, useNativeDriver: false })
    ]).start();

    setTimeout(() => {
      hideToast();
    }, duration);
  }, [duration, hideToast]);

  useEffect(() => {
    showToast();
  }, [showToast]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={Colors.light.card} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={Colors.light.card} />;
      case 'warning':
        return <Ionicons name="warning" size={24} color={Colors.light.card} />;
      case 'info':
        return <Ionicons name="information-circle" size={24} color={Colors.light.card} />;
      default:
        return <Ionicons name="information-circle" size={24} color={Colors.light.card} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.light.primary;
      case 'error':
        return Colors.light.error;
      case 'warning':
        return Colors.light.warning;
      case 'info':
        return Colors.light.info;
      default:
        return Colors.light.text;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset + 16 }]}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor(), transform: [{ translateY: translateY.current }], opacity: opacity.current }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={styles.message} numberOfLines={2}>{message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0,
    minWidth: 200,
    maxWidth: '90%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.card,
    lineHeight: 20,
  },
});

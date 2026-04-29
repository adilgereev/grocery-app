import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Duration, FontSize, Spacing } from '@/constants/theme';
import { useNetworkStore } from '@/store/networkStore';

// высота строки баннера без учёта safe area (compact notification strip)
const CONTENT_HEIGHT = 40;
const RESTORED_MS = 2000;

type BannerPhase = 'hidden' | 'offline' | 'restored';

export function NetworkBanner() {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const { top } = useSafeAreaInsets();

  const [phase, setPhase] = useState<BannerPhase>('hidden');
  const animHeight = useSharedValue(0);
  const animOpacity = useSharedValue(0);
  const wasOffline = useRef(false);

  useEffect(() => {
    const totalHeight = CONTENT_HEIGHT + top;

    if (!isConnected) {
      wasOffline.current = true;
      setPhase('offline');
      animHeight.value = withTiming(totalHeight, { duration: Duration.default });
      animOpacity.value = withTiming(1, { duration: Duration.default });
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setPhase('restored');
      const timer = setTimeout(() => {
        animHeight.value = withTiming(0, { duration: Duration.default });
        animOpacity.value = withTiming(
          0,
          { duration: Duration.default },
          (finished) => {
            if (finished) runOnJS(setPhase)('hidden');
          }
        );
      }, RESTORED_MS);
      return () => clearTimeout(timer);
    }
  }, [isConnected, top, animHeight, animOpacity]);

  const animStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
    opacity: animOpacity.value,
  }));

  if (phase === 'hidden') return null;

  const offline = phase === 'offline';

  return (
    <Animated.View
      testID="network-banner"
      style={[
        styles.banner,
        offline ? styles.bannerOffline : styles.bannerRestored,
        animStyle,
      ]}
    >
      <View style={[styles.content, { paddingTop: top }]}>
        <Ionicons
          name={offline ? 'wifi-outline' : 'wifi'}
          size={15}
          color={Colors.light.white}
        />
        <Text style={styles.text}>
          {offline ? 'Нет подключения к сети' : 'Соединение восстановлено'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
  },
  bannerOffline: {
    backgroundColor: Colors.light.error,
  },
  bannerRestored: {
    backgroundColor: Colors.light.success,
  },
  content: {
    height: CONTENT_HEIGHT + Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
  },
  text: {
    color: Colors.light.white,
    fontSize: FontSize.s,
    fontWeight: '600',
  },
});

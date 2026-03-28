import React, { useEffect } from 'react';
import { StyleSheet, DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming
} from 'react-native-reanimated';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1, // бесконечное повторение
      true // revert (туда-обратно)
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.light.border, // светло-серый Tailwind gray-200
    overflow: 'hidden',
  },
});

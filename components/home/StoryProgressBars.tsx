import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Story } from '@/types';

interface Props {
  stories: Story[];
  currentIndex: number;
  progressAnim: Animated.Value;
}

export default function StoryProgressBars({ stories, currentIndex, progressAnim }: Props) {
  return (
    <View style={s.progressContainer}>
      {stories.map((_, i) => {
        const width = i < currentIndex
          ? '100%'
          : i === currentIndex
            ? progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            })
            : '0%';

        return (
          <View key={i} style={s.progressTrack}>
            <Animated.View
              style={[s.progressFill, { width }]}
            />
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  progressContainer: {
    position: 'absolute',
    top: 52,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: Colors.light.whiteTransparent,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.white,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle: string | null;
}

export default function StoryTextContent({ title, subtitle }: Props) {
  return (
    <View style={s.textContainer}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? (
        <Text style={s.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  textContainer: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.m,
    right: Spacing.m,
  },
  title: {
    color: Colors.light.white,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.light.white,
    fontSize: FontSize.m,
    fontWeight: '500',
    opacity: 0.85,
  },
});

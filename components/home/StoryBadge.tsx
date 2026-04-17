import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  type: 'promo' | 'new_product';
}

export default function StoryBadge({ type }: Props) {
  const isPromo = type === 'promo';

  return (
    <View style={[s.badge, isPromo ? s.badgePromo : s.badgeNew]}>
      <Text style={s.badgeText}>
        {isPromo ? 'АКЦИЯ' : 'НОВИНКА'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 70,
    left: Spacing.m,
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgePromo: { backgroundColor: Colors.light.cta },
  badgeNew: { backgroundColor: Colors.light.info },
  badgeText: {
    color: Colors.light.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});

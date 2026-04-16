import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ProductFormSkeleton() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={s.skeletonField}>
          <Skeleton width={120} height={14} style={s.skeletonLabel} />
          <Skeleton width="100%" height={50} borderRadius={Radius.m} />
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.card },
  content: { padding: Spacing.l, paddingBottom: 60, maxWidth: 800, width: '100%', alignSelf: 'center' },
  skeletonField: { marginBottom: Spacing.m },
  skeletonLabel: { marginBottom: 8 },
});

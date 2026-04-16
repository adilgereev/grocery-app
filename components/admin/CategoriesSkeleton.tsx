import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Skeleton from '@/components/ui/Skeleton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Radius, Spacing } from '@/constants/theme';

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  list: {
    padding: Spacing.m,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  skeletonIcon: {
    marginRight: Spacing.m,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonLine: {
    marginBottom: 6,
  },
});

export default function CategoriesSkeleton() {
  return (
    <SafeAreaView edges={['bottom']} style={s.container}>
      <ScreenHeader title="Категории" />
      <View style={s.list}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <View key={i} style={s.skeletonRow}>
            <Skeleton width={44} height={44} borderRadius={Radius.m} style={s.skeletonIcon} />
            <View style={s.skeletonTextContainer}>
              <Skeleton width="60%" height={15} style={s.skeletonLine} />
              <Skeleton width="35%" height={13} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

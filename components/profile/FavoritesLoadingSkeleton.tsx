import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function FavoritesLoadingSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader title="Избранное" />
      <View style={styles.skeletonContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width="47%" height={230} borderRadius={Radius.l} style={styles.skeletonItem} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m,
  },
  skeletonItem: { marginBottom: Spacing.m },
});

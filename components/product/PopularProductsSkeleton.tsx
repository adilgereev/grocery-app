import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Spacing, Radius, Colors, Shadows } from '@/constants/theme';

interface PopularProductsSkeletonProps {
  count?: number;
}

export default function PopularProductsSkeleton({ count = 4 }: PopularProductsSkeletonProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.round((width - 32 - 16) / 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width="50%" height={24} borderRadius={8} />
        <Skeleton width="10%" height={16} borderRadius={4} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={[styles.card, { width: cardWidth }]}>
            <View style={[styles.imageWrapper, { height: cardWidth }]}>
              <Skeleton width="100%" height="100%" borderRadius={Radius.l} />
            </View>
            <View style={styles.info}>
              <Skeleton width="50%" height={18} borderRadius={4} style={styles.skeletonPrice} />
              <Skeleton width="90%" height={14} borderRadius={4} style={styles.skeletonName} />
              <Skeleton width="85%" height={14} borderRadius={4} style={styles.skeletonName} />
            </View>
            <View style={styles.action}>
              <Skeleton width="100%" height={40} borderRadius={Radius.pill} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.s,
  },
  scrollContent: {
    paddingHorizontal: Spacing.m,
  },
  card: {
    marginRight: Spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: Radius.l,
    overflow: 'hidden',
    marginBottom: Spacing.s,
  },
  info: {
    flex: 1,
    marginBottom: Spacing.s,
  },
  skeletonPrice: { marginBottom: 4 },
  skeletonName: { marginBottom: 4 },
  action: {},
});

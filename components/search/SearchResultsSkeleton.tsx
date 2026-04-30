import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

function SkeletonCard({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Skeleton width="100%" height={cardWidth} borderRadius={Radius.l} style={styles.image} />
      <View style={styles.info}>
        <Skeleton width="50%" height={18} borderRadius={Radius.xs} style={styles.price} />
        <Skeleton width="90%" height={14} borderRadius={Radius.xs} style={styles.name} />
        <Skeleton width="70%" height={14} borderRadius={Radius.xs} style={styles.name} />
      </View>
      <Skeleton width="100%" height={40} borderRadius={Radius.pill} />
    </View>
  );
}

export default function SearchResultsSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.round((width - Spacing.m * 2 - Spacing.m) / 2);

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} cardWidth={cardWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Spacing.m,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  image: {
    marginBottom: Spacing.s,
  },
  info: {
    marginBottom: Spacing.s,
  },
  price: {
    marginBottom: Spacing.xxs,
  },
  name: {
    marginBottom: Spacing.xs,
  },
});

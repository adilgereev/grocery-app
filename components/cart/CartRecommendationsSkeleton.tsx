import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

interface Props {
  cardWidth: number;
}

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

export default function CartRecommendationsSkeleton({ cardWidth }: Props) {
  return (
    <View style={styles.container}>
      <Skeleton width="50%" height={24} borderRadius={Radius.xs} style={styles.title} />
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} cardWidth={cardWidth} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.s,
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

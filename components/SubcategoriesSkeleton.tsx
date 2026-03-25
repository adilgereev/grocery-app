import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { Spacing, Radius } from '@/constants/theme';

interface SubcategoriesSkeletonProps {
  count?: number;
}

export default function SubcategoriesSkeleton({ count = 4 }: SubcategoriesSkeletonProps) {
  return (
    <View style={styles.container}>
      <Skeleton width="40%" height={24} borderRadius={8} style={styles.titleSkeleton} />
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.cardContainer}>
            <Skeleton width="100%" height={140} borderRadius={Radius.l} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  titleSkeleton: {
    marginBottom: Spacing.m,
    marginLeft: Spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.m,
  },
  cardContainer: {
    width: '48%',
    marginRight: Spacing.s,
    marginBottom: Spacing.s,
  },
});

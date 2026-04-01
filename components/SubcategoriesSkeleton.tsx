import { Radius, Spacing } from '@/constants/theme';
import { getMosaicCardWidth } from '@/utils/mosaicLayout';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Skeleton from './Skeleton';

interface SubcategoriesSkeletonProps {
  count?: number;
}

export default function SubcategoriesSkeleton({ count = 5 }: SubcategoriesSkeletonProps) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - Spacing.m * 2;
  const GAP = 8;

  return (
    <View style={styles.container}>
      <Skeleton width="40%" height={24} borderRadius={8} style={styles.titleSkeleton} />
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, i) => {
          const cardWidth = getMosaicCardWidth(
            i, 
            count, 
            containerWidth, 
            GAP
          );

          return (
            <View key={i} style={[styles.cardContainer, { width: cardWidth }]}>
              <Skeleton width="100%" height={118} borderRadius={Radius.xxl} />
            </View>
          );
        })}
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
    justifyContent: 'space-between',
    columnGap: 8,
    rowGap: 8,
  },
  cardContainer: {
    // Ширина задается динамически
  },
});

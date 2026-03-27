import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { Spacing, Radius } from '@/constants/theme';

interface SubcategoriesSkeletonProps {
  count?: number;
}

export default function SubcategoriesSkeleton({ count = 5 }: SubcategoriesSkeletonProps) {
  return (
    <View style={styles.container}>
      <Skeleton width="40%" height={24} borderRadius={8} style={styles.titleSkeleton} />
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, i) => {
          // Мозаичная сетка (5 элементов = 1 блок паттерна)
          const patternIndex = i % 5;
          let cardWidth: `${number}%` = '31%';
          if (patternIndex === 0) cardWidth = '58%';
          if (patternIndex === 1) cardWidth = '38%';

          return (
            <View key={i} style={[styles.cardContainer, { width: cardWidth }]}>
              <Skeleton width="100%" height={110} borderRadius={Radius.l} />
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
    rowGap: Spacing.m,
  },
  cardContainer: {
    // Ширина задается динамически
  },
});

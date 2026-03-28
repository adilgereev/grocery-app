import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Skeleton from './Skeleton';
import { Spacing, Radius, Colors } from '@/constants/theme';

interface PopularProductsSkeletonProps {
  count?: number;
}

export default function PopularProductsSkeleton({ count = 4 }: PopularProductsSkeletonProps) {
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
          <View key={i} style={styles.card}>
            {/* Имитация картинки с плавающей кнопкой */}
            <View style={styles.imageWrapper}>
              <Skeleton width="100%" height={110} borderRadius={0} />
              <View style={styles.floatingButton}>
                <Skeleton width={32} height={32} borderRadius={16} />
              </View>
            </View>
            
            <View style={styles.info}>
              {/* Имитация названия (1 строка для чистоты) */}
              <Skeleton width="90%" height={14} borderRadius={4} style={styles.skeletonText} />
              
              {/* Футер: только цена */}
              <Skeleton width="50%" height={16} borderRadius={4} />
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
    width: 140,
    height: 180,
    marginRight: Spacing.m,
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: 0,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    height: 110,
    width: '100%',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  info: {
    padding: Spacing.s,
    flex: 1,
    justifyContent: 'center',
  },
  skeletonText: { marginBottom: 8 },
});

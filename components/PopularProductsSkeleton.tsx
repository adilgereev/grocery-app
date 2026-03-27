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
            {/* Имитация картинки */}
            <Skeleton width="100%" height={110} borderRadius={Radius.xl} />
            
            <View style={styles.info}>
              {/* Имитация названия (2 строки) */}
              <Skeleton width="90%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width="60%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
              
              {/* Имитация цены */}
              <Skeleton width="40%" height={16} borderRadius={4} />
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
    width: 130,
    marginRight: Spacing.m,
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: 0,
    overflow: 'hidden',
    // Тень не добавляем в скелетон, чтобы он был "плоским" до загрузки
  },
  info: {
    padding: Spacing.s,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function OrderDetailsLoadingState() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={150} height={24} borderRadius={Radius.s} />
      </View>
      <View style={styles.loadingContainer}>
        <Skeleton width="100%" height={120} borderRadius={Radius.xl} style={styles.skeletonLarge} />
        <Skeleton width="100%" height={80} borderRadius={Radius.l} style={styles.skeletonMedium} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { padding: Spacing.m },
  loadingContainer: { padding: Spacing.m },
  skeletonLarge: { marginBottom: Spacing.ml },
  skeletonMedium: { marginBottom: 16 },
});

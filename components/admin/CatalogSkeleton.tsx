import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function CatalogSkeleton() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Товары" />
      <View style={styles.list}>
        {[1, 2, 3].map(section => (
          <View key={section}>
            <Skeleton width={140} height={24} style={styles.skeletonSectionTitle} />
            {[1, 2, 3].map(item => (
              <View key={item} style={[styles.card, styles.skeletonCardRow]}>
                <Skeleton width={60} height={60} borderRadius={Radius.m} style={styles.skeletonImage} />
                <View style={styles.skeletonTextContainer}>
                  <Skeleton width="70%" height={15} style={styles.skeletonLine} />
                  <Skeleton width="40%" height={13} style={styles.skeletonLine} />
                  <Skeleton width="30%" height={16} />
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  list: { padding: Spacing.m },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  skeletonSectionTitle: { marginTop: Spacing.m, marginBottom: Spacing.s },
  skeletonCardRow: { flexDirection: 'row', alignItems: 'center' },
  skeletonImage: { marginRight: Spacing.m },
  skeletonTextContainer: { flex: 1 },
  skeletonLine: { marginBottom: 6 },
});

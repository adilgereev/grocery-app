import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '@/components/ui/Skeleton';
import { Spacing, Radius } from '@/constants/theme';

export default function CategoryLoadingState() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} width="47%" height={230} borderRadius={Radius.l} style={styles.item} />
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
  item: { marginBottom: Spacing.m },
});

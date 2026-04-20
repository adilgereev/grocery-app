import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows, FontSize } from '@/constants/theme';
import { OrderStatusHistory as OrderStatusHistoryType } from '@/types';
import { STATUS_CONFIG } from './orderConfig';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

interface Props {
  history: OrderStatusHistoryType[];
}

export default function OrderStatusHistory({ history }: Props) {

  return (
    <View style={styles.card}>
      <Text style={styles.title}>История статусов</Text>
      {history.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.pending;
        const isLast = index === history.length - 1;
        return (
          <View key={entry.id} style={styles.row} testID={`order-history-item-${entry.id}`}>
            <View style={styles.timelineColumn}>
              <View style={[styles.dot, { backgroundColor: config.color }]} />
              {!isLast && <View style={styles.line} />}
            </View>
            <View style={[styles.content, !isLast && styles.contentWithBorder]}>
              <Text style={[styles.label, { color: config.color }]}>{config.shortLabel}</Text>
              <Text style={styles.date}>{formatDate(entry.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  title: {
    fontSize: FontSize.s,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: Spacing.s,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: Colors.light.borderLight,
    marginTop: 4,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.s,
  },
  contentWithBorder: {
    marginBottom: 2,
  },
  label: {
    fontSize: FontSize.s,
    fontWeight: '600',
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});

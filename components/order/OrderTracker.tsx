import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

interface OrderTrackerProps {
  steps: string[];
  currentStepIndex: number;
  statusConfigs: Record<string, { label: string; icon: string; color: string }>;
  accentColor: string;
}

/**
 * Визуальный трекер прогресса заказа.
 * Показывает этапы: Сборка -> В пути -> Доставлен.
 */
const OrderTracker = ({ steps, currentStepIndex, statusConfigs, accentColor }: OrderTrackerProps) => {
  return (
    <View style={styles.trackerCard}>
      <View style={styles.trackerRow}>
        {steps.map((step, index) => {
          const stepConfig = statusConfigs[step];
          const isActive = index <= currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step}>
              <View style={styles.trackerStep}>
                <View style={[
                  styles.trackerDot,
                  isActive 
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : styles.trackerDotInactive
                ]}>
                  <Ionicons
                    name={stepConfig.icon as any}
                    size={16}
                    color={isActive ? Colors.light.white : Colors.light.textLight}
                  />
                </View>
                <Text style={[
                  styles.trackerLabel,
                  { color: isActive ? Colors.light.text : Colors.light.textLight }
                ]}>
                  {stepConfig.label.split(' ')[0]}
                </Text>
              </View>
              {!isLast && (
                <View style={[
                  styles.trackerLine,
                  { backgroundColor: index < currentStepIndex ? accentColor : Colors.light.border }
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

export default React.memo(OrderTracker);

const styles = StyleSheet.create({
  trackerCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.sm,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  trackerStep: {
    alignItems: 'center',
    width: 76,
  },
  trackerDot: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  trackerDotInactive: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.border,
  },
  trackerLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  trackerLine: {
    flex: 1,
    height: 3,
    marginTop: 16,
    marginHorizontal: -4,
    borderRadius: 2,
  },
});

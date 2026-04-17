import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatPhoneDisplay } from '@/lib/services/sms';

interface PhoneSectionProps {
  phone: string;
}

export default function PhoneSection({ phone }: PhoneSectionProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Телефон</Text>
      <View style={styles.phoneDisplay}>
        <Text style={styles.phoneText}>
          {phone ? formatPhoneDisplay(phone) : 'Не указан'}
        </Text>
      </View>
      <Text style={styles.phoneHint}>
        Для изменения номера обратитесь в поддержку
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: Spacing.m + Spacing.s,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.disabledBackground,
    borderRadius: Radius.l,
    padding: Spacing.m,
  },
  phoneText: {
    flex: 1,
    fontSize: FontSize.l,
    fontWeight: '600',
    color: Colors.light.disabledText,
    fontFamily: Fonts.sans,
  },
  phoneHint: {
    fontSize: FontSize.s,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
  label: {
    fontSize: FontSize.m,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s,
    fontFamily: Fonts.sans,
  },
});

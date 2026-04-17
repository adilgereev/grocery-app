import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';

export default function SetupProfileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Ionicons name="person" size={40} color={Colors.light.white} />
      </View>
      <Text style={styles.appName}>Как вас зовут?</Text>
      <Text style={styles.subtitle}>
        Представьтесь, чтобы мы могли обращаться к вам по имени
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: 60,
    paddingHorizontal: Spacing.l,
  },
  logoContainer: {
    width: 84,
    height: 84,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: Fonts.sans,
  },
});

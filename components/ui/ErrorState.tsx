import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  error: string;
  title?: string;
  isRetrying?: boolean;
  onRetry?: () => void;
}

export default function ErrorState({ error, title = 'Ошибка загрузки', isRetrying = false, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          {isRetrying ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <Text style={styles.buttonText}>Повторить</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  message: {
    fontSize: FontSize.m,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Radius.pill,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: FontSize.m,
    fontWeight: '600',
  },
});

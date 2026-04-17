import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';

interface CategoryErrorStateProps {
  error: string;
  isRetrying?: boolean;
  onRetry: () => void;
}

export default function CategoryErrorState({
  error,
  isRetrying = false,
  onRetry,
}: CategoryErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
      <Text style={styles.title}>Ошибка загрузки</Text>
      <Text style={styles.message}>{error}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        {isRetrying ? (
          <ActivityIndicator color={Colors.light.white} />
        ) : (
          <Text style={styles.buttonText}>Повторить</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.m,
    marginBottom: Spacing.s,
  },
  message: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Spacing.l,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface SearchNoResultsProps {
  error: string | null;
  loading: boolean;
  onRetry: () => void;
}

export default function SearchNoResults({
  error,
  loading,
  onRetry,
}: SearchNoResultsProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={60} color={Colors.light.icon} />
      <Text style={styles.emptyText}>{error || 'Ничего не найдено'}</Text>
      <Text style={styles.emptySubText}>
        {error ? 'Нажмите "Повторить" для повторной попытки' : 'Попробуйте изменить запрос'}
      </Text>
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          disabled={loading}
          testID="search-retry-button"
        >
          {loading ? (
            <ActivityIndicator color={Colors.light.white} />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color={Colors.light.white} style={styles.retryIcon} />
              <Text style={styles.retryButtonText}>Повторить</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    marginTop: Spacing.m,
  },
  emptySubText: {
    fontSize: 15,
    color: Colors.light.textLight,
    marginTop: Spacing.s,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: Radius.pill,
    marginTop: Spacing.m,
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  retryIcon: {
    marginRight: 8,
  },
});

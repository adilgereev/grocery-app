import React, { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name="warning" size={48} color={Colors.light.error} />
              </View>
            </View>

            <Text style={styles.title}>Упс, что-то пошло не так</Text>
            <Text style={styles.subtitle}>
              {this.state.error?.message || 'Неизвестная ошибка'}
            </Text>

            {this.state.errorInfo && (
              <View style={styles.detailsContainer}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => {
                    if (this.state.errorInfo?.componentStack) {
                      logger.log('Component Stack:', this.state.errorInfo.componentStack);
                    }
                  }}
                >
                  <Ionicons name="code-slash" size={20} color={Colors.light.textSecondary} />
                  <Text style={styles.detailsButtonText}>Показать детали</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.reloadButton} onPress={this.handleReset}>
              <Ionicons name="refresh" size={20} color={Colors.light.card} style={styles.reloadIcon} />
              <Text style={styles.reloadButtonText}>Перезагрузить приложение</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.05,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  detailsContainer: {
    marginBottom: Spacing.xl,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    padding: Spacing.s,
  },
  detailsButtonText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    elevation: 0,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.05,
  },
  reloadIcon: {
    marginRight: Spacing.s,
  },
  reloadButtonText: {
    color: Colors.light.card,
    fontSize: 16,
    fontWeight: '700',
  },
});

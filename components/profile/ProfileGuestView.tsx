import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

interface ProfileGuestViewProps {
  paddingTop: number;
  onLoginPress: () => void;
}

export default function ProfileGuestView({ paddingTop, onLoginPress }: ProfileGuestViewProps) {
  return (
    <View style={[styles.guestContainer, { paddingTop }]}>
      <View style={styles.guestContent}>
        <View style={styles.guestAvatarIcon}>
          <Ionicons name="person" size={44} color={Colors.light.primary} />
        </View>
        <Text style={styles.guestTitle}>
          Ваш профиль
        </Text>
        <Text style={styles.guestSubtitle}>
          Войдите, чтобы оформлять заказы,{'\n'}копить бонусы и видеть историю покупок
        </Text>

        <TouchableOpacity
          style={styles.guestButton}
          activeOpacity={0.8}
          onPress={onLoginPress}
          testID="profile-guest-login-button"
        >
          <View style={styles.guestButtonSolid}>
            <Text style={styles.guestButtonText}>Войти или зарегистрироваться</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guestContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  guestContent: {
    alignItems: 'center',
  },
  guestAvatarIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  guestTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  guestButton: {
    width: '100%',
    height: 56,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  guestButtonSolid: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

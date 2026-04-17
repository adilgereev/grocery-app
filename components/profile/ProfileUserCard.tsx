import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '@/components/ui/Skeleton';
import { formatPhoneDisplay } from '@/lib/services/sms';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

interface ProfileUserCardProps {
  loading: boolean;
  initials: string;
  displayName: string;
  phone: string | undefined;
  onPress: () => void;
}

export default function ProfileUserCard({
  loading,
  initials,
  displayName,
  phone,
  onPress,
}: ProfileUserCardProps) {
  if (loading) {
    return <Skeleton width="100%" height={80} borderRadius={Radius.xl} style={{ marginBottom: Spacing.l }} />;
  }

  return (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.8}
      onPress={onPress}
      testID="profile-user-card"
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.userPhone}>{phone ? formatPhoneDisplay(phone) : 'Телефон не указан'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.light.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    ...Shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 1,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});

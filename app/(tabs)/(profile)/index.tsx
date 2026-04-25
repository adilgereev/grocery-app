import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useProfile } from '@/components/profile/useProfile';
import ProfileGuestView from '@/components/profile/ProfileGuestView';
import ProfileUserCard from '@/components/profile/ProfileUserCard';
import ProfileMenuCards from '@/components/profile/ProfileMenuCards';

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { loading, profile, initials, displayName, handleLogout } = useProfile();

  if (!session) {
    return (
      <ProfileGuestView
        paddingTop={insets.top}
        onLoginPress={() => router.push('/(auth)/login')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
        <Text style={styles.headerTitle}>Профиль</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileUserCard
          loading={loading}
          initials={initials}
          displayName={displayName}
          phone={profile?.phone}
          onPress={() => router.push('/edit-profile')}
        />

        <ProfileMenuCards
          isAdmin={profile?.is_admin ?? false}
          isStaff={(profile?.is_picker ?? false) || (profile?.is_courier ?? false)}
          onLogout={handleLogout}
          onNavigate={(route) => router.push(route as any)}
        />

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.ml,
    backgroundColor: Colors.light.background,
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: FontSize.big,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.ml,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  footerSpacing: {
    height: Spacing.xxl,
  },
});

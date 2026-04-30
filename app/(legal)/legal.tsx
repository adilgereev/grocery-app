import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export default function LegalInfoScreen() {
  const router = useRouter();

  const handlePrivacyPress = useCallback(() => {
    router.push('/privacy-policy');
  }, [router]);

  const handlePublicOfferPress = useCallback(() => {
    router.push('/public-offer');
  }, [router]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Юридическая информация" />
      
      <View style={styles.content}>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPress}
            testID="legal-menu-privacy"
          >
            <Ionicons name="document-text-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Политика конфиденциальности</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePublicOfferPress}
            testID="legal-menu-public-offer"
          >
            <Ionicons name="reader-outline" size={22} color={Colors.light.textSecondary} style={styles.menuItemIcon} />
            <Text style={styles.menuText}>Публичная оферта</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.m,
  },
  menuCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  menuItemIcon: {
    marginRight: Spacing.m,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 56,
  },
});

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Fonts, Spacing, Shadows } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  showBackBtn?: boolean;
  onBackPress?: () => void;
  rightElement?: ReactNode;
}

export default function ScreenHeader({
  title,
  showBackBtn,
  onBackPress,
  rightElement,
}: ScreenHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const canGoBack = showBackBtn ?? navigation.canGoBack();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
      {canGoBack ? (
        <TouchableOpacity testID="header-back-button" onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      
      {rightElement ? (
        <View style={styles.rightElementContainer}>{rightElement}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.m,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  backButton: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: '700', // Мягкий заголовок (Soft Bold)
    color: Colors.light.text,
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  spacer: {
    width: Spacing.xxxl,
  },
  rightElementContainer: {
    width: Spacing.xxxl,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

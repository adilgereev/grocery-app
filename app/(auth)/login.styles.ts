import { Platform, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

export const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.white },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 10,
    padding: 10,
    zIndex: 100,
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  innerContainer: { paddingBottom: 60 },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: 60,
  },
  logoContainer: {
    width: 84, height: 84,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.xxl, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  appName: {
    fontSize: 28, fontWeight: '700', color: Colors.light.text,
    letterSpacing: 0.5, marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: Colors.light.textSecondary,
    textAlign: 'center', fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.light.glassBackground,
    marginHorizontal: Spacing.m,
    borderRadius: Radius.xxl + 4,
    padding: Spacing.xl,
    ...Shadows.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.glassBorder,
  },
  formTitle: {
    fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 8,
  },
  formHint: {
    fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20,
    marginBottom: Spacing.l,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    height: 56,
    marginBottom: Spacing.m,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: Spacing.s,
  },
  countryCode: { color: Colors.light.text, fontWeight: '700' },

  primaryButton: {
    backgroundColor: Colors.light.primary, borderRadius: Radius.m,
    height: 54, justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  primaryButtonDisabled: { backgroundColor: Colors.light.primaryLight },
  primaryButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },

  otpBackButton: {
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m,
  },
  backButtonText: { marginLeft: 8, color: Colors.light.textSecondary, fontWeight: '600' },
  otpContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.s,
  },
  otpInput: {
    width: 60, height: 64,
    borderWidth: 2, borderColor: Colors.light.border, borderRadius: Radius.m,
    fontSize: 24, fontWeight: '700', color: Colors.light.text,
    textAlign: 'center', backgroundColor: Colors.light.borderLight,
  },
  otpInputFilled: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primaryLight },
  resendButton: { marginTop: Spacing.l, alignItems: 'center' },
  resendText: { fontSize: 13, fontWeight: '600' },
  resendTextActive: { color: Colors.light.primary },
  resendTextDisabled: { color: Colors.light.textLight },
  otpLoader: { marginTop: Spacing.m },
});

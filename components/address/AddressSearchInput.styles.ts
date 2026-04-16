import { Platform, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

export const addressSearchStyles = StyleSheet.create({
  container: { zIndex: 100 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.card, minHeight: 54, borderRadius: Radius.l,
    paddingHorizontal: Spacing.m,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  icon: { marginRight: Spacing.s },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  hintText: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 4,
    marginLeft: Spacing.m,
  },
  loader: { marginRight: Spacing.s },
  placeholderContainer: {
    position: 'absolute',
    left: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.textLight,
  },
  suggestionsContainer: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    marginTop: 6,
    backgroundColor: Colors.light.card, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.light.border,
    ...Shadows.lg,
    maxHeight: 280, overflow: 'hidden',
  },
  suggestionsScroll: {
    maxHeight: 280,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.m, paddingVertical: Spacing.sm,
  },
  suggestionDivider: {
    height: 1, backgroundColor: Colors.light.borderLight,
    marginLeft: Spacing.m + 10 + 18, // отступ под иконку
  },
  suggestionIcon: { marginRight: 10, marginTop: 2 },
  suggestionText: { fontSize: 14, color: Colors.light.text, fontWeight: '600', lineHeight: 20 },
  flex1: { flex: 1 },
});

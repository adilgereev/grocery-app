import { Platform, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

export const addressSearchStyles = StyleSheet.create({
  container: { zIndex: 100 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.card, minHeight: 54, borderRadius: Radius.m,
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
    marginTop: 4,
    backgroundColor: Colors.light.card, borderRadius: Radius.m,
    ...Shadows.md,
    maxHeight: 400, overflow: 'hidden',
  },
  suggestionsScroll: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.m,
  },
  suggestionIcon: { marginRight: 10 },
  suggestionText: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  suggestionSubtext: { fontSize: 12, color: Colors.light.textLight, marginTop: 2 },
  flex1: { flex: 1 },
});

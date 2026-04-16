import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.light.card },
  content: { padding: Spacing.l, paddingBottom: 60, maxWidth: 800, width: '100%', alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: Colors.light.text, marginTop: Spacing.m, marginBottom: 8 },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
  },
  flex: { flex: 1, marginRight: Spacing.s },
  switchContainer: {
    justifyContent: 'flex-start',
  },
  categoryInput: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.m,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: { fontSize: 16 },
  textArea: { height: 100 },
  row: { flexDirection: 'row', alignItems: 'center' },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.l,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.light.white, fontSize: 16, fontWeight: '700' },
});

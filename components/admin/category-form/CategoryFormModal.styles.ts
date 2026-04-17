import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: Colors.light.blackTransparent, 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: Colors.light.card, 
    borderTopLeftRadius: Radius.xxl, 
    borderTopRightRadius: Radius.xxl, 
    padding: Spacing.l, 
    maxHeight: '80%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Spacing.xl 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: Colors.light.text 
  },
  formGroup: { 
    marginBottom: Spacing.l 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: Colors.light.textSecondary,
    marginBottom: Spacing.s
  },
  input: {
    backgroundColor: Colors.light.background, 
    height: 50, 
    borderRadius: Radius.m, 
    paddingHorizontal: Spacing.m,
    fontSize: 16, 
    color: Colors.light.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: Colors.light.primary, 
    height: 56, 
    borderRadius: Radius.l,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: Spacing.m, 
    marginBottom: Spacing.xl,
  },
  submitBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700'
  },
  btnDisabled: { 
    opacity: 0.6 
  },
});

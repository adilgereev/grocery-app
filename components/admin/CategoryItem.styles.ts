import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.l,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    ...Shadows.md,
  },
  subcategoryCard: {
    marginLeft: Spacing.xl,
    marginRight: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  hierarchyIcon: {
    marginRight: Spacing.s,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: Radius.m,
    marginRight: Spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  parentBadge: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  collapseBtn: {
    padding: 6,
    marginRight: 4,
  },
  orderActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.s,
    borderLeftWidth: 1,
    borderLeftColor: Colors.light.borderLight,
  },
  orderBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    paddingTop: Spacing.s,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.s,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: Colors.light.primary,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: Colors.light.error,
  },
  hiddenText: {
    color: Colors.light.textLight,
  },
  inactiveCard: {
    opacity: 0.5,
  },
});

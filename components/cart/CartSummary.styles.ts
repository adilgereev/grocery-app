import { StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

export const cartSummaryStyles = StyleSheet.create({
  listFooter: {
    marginTop: Spacing.m,
    paddingBottom: 20,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.l,
    ...Shadows.md,
  },
  addressTextContainer: { flex: 1, marginRight: 12 },
  addressSelectedText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
  addressPlaceholder: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500'
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  paymentContainer: {
    gap: 10,
    marginBottom: Spacing.l,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    borderWidth: 2,
    borderColor: Colors.light.card,
    ...Shadows.sm,
  },
  paymentOptionSelected: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primaryBorder,
    borderWidth: 2,
    ...Shadows.md,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  paymentMethodInfo: { flex: 1 },
  paymentLabelOption: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentLabelOptionSelected: {
    color: Colors.light.primary,
  },
  paymentDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  paymentCheckmark: {
    marginLeft: Spacing.s,
  },
  receiptCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xl,
    padding: Spacing.ml,
    ...Shadows.md,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  receiptText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  receiptTextFree: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: Spacing.m,
    marginHorizontal: -Spacing.ml,
  },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  receiptTotalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  organicButtonContainer: { marginTop: Spacing.l },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cta,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.ml,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
  },
  checkoutButtonSubmitting: { opacity: 0.7 },
  checkoutText: {
    color: Colors.light.white,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: Spacing.s,
  },
  checkoutPriceTag: {
    backgroundColor: Colors.light.whiteTransparent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.xl,
  },
  checkoutPriceText: {
    color: Colors.light.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

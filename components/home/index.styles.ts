import { Dimensions, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.light.card,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    ...Shadows.sm,
    zIndex: 10,
  },
  safeAreaTop: { backgroundColor: Colors.light.card },
  greetingAnimationContainer: { overflow: 'hidden' },

  // Приветствие и адрес
  greetingContainer: {
    justifyContent: 'center',
    paddingBottom: Spacing.m,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  addressText: {
    fontSize: 13, color: Colors.light.textSecondary, fontWeight: '500',
    maxWidth: SCREEN_WIDTH * 0.85,
  },

  // Поиск
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.m, height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInputText: { flex: 1, fontSize: 16, color: Colors.light.textSecondary },

  listContainer: { paddingTop: 0, paddingBottom: 80 },
  hierarchyContainer: {
    paddingTop: 0,
  },

  // Баннеры
  bannersSection: { marginBottom: Spacing.xl, marginTop: Spacing.m },
  bannersTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text, paddingHorizontal: Spacing.m, marginBottom: Spacing.s },
  bannersScroll: { paddingHorizontal: Spacing.m },
  bannerCard: {
    width: SCREEN_WIDTH * 0.8, height: 160, marginRight: Spacing.m, borderRadius: Radius.xl,
    ...Shadows.md,
  },
  bannerImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerTitle: {
    color: Colors.light.white, fontSize: 20, fontWeight: '700',
    textShadowColor: Colors.light.blackTransparent, textShadowOffset: { width: 0, height: 2 },
    position: 'absolute', bottom: Spacing.m, left: Spacing.m, right: Spacing.m,
  },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: Radius.l },

  // Популярное
  popularSection: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.m, marginBottom: Spacing.s,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text },
  seeAllText: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  popularScroll: { paddingHorizontal: Spacing.m },
  popularCard: {
    width: 140, marginRight: Spacing.m, backgroundColor: Colors.light.card, borderRadius: Radius.l,
    overflow: 'hidden',
    ...Shadows.md,
  },
  imageWrapper: { position: 'relative', width: '100%', height: 110 },
  imagePlaceholder: { backgroundColor: Colors.light.borderLight },
  popularImage: { width: '100%', height: '100%' },
  popularInfo: { padding: Spacing.s, flex: 1, justifyContent: 'center' },
  popularName: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary, marginBottom: 2 },
  popularPrice: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  popularUnit: { fontSize: 11, color: Colors.light.textLight, fontWeight: '600' },
  addPopularButton: {
    position: 'absolute', bottom: 8, right: 8,
    width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.light.cta,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  categoryFallbackTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text, paddingHorizontal: Spacing.m }
});

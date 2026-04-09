import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { Dimensions, StyleSheet } from 'react-native';

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

  // Сторис
  storiesSection: { marginBottom: Spacing.l, marginTop: Spacing.m },
  storiesTitle: {
    fontSize: 22, fontWeight: '700', color: Colors.light.text,
    paddingHorizontal: Spacing.m, marginBottom: Spacing.s,
  },
  storiesScroll: { paddingHorizontal: Spacing.m, gap: Spacing.s },
  storyItem: { alignItems: 'center', width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3) },
  // Градиентная рамка для непросмотренных сторис (вертикальный прямоугольник)
  storyGradientBorder: {
    width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3),
    height: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3 * 1.25),
    borderRadius: Radius.xl, padding: 2.5, marginBottom: Spacing.xs,
  },
  // Серая рамка для просмотренных сторис
  storyWatchedBorder: {
    width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3),
    height: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3 * 1.3),
    borderRadius: Radius.xl, padding: 2.5,
    backgroundColor: Colors.light.border, marginBottom: Spacing.xs,
  },
  storyInnerBorder: {
    flex: 1, borderRadius: Radius.l,
    backgroundColor: Colors.light.card,
    padding: 2, overflow: 'hidden',
  },
  storyImage: { width: '100%', height: '100%', borderRadius: Radius.m },
  storyTitle: {
    fontSize: 11, color: Colors.light.textSecondary,
    textAlign: 'center', fontWeight: '500',
    width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3),
  },
  storyTitleWatched: { color: Colors.light.textLight },
  // Скелетон для загрузки сторис
  storySkeletonCircle: {
    width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3),
    height: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3 * 1.25),
    borderRadius: Radius.xl,
    backgroundColor: Colors.light.borderLight, marginBottom: Spacing.xs,
  },
  storySkeletonTitle: {
    width: Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3 * 0.7),
    height: 8, borderRadius: Radius.s,
    backgroundColor: Colors.light.borderLight,
  },

  // Популярное
  popularSection: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.m, marginBottom: Spacing.s,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text },
  seeAllText: { fontSize: 14, color: Colors.light.primary, fontWeight: '600' },
  popularScroll: { paddingHorizontal: Spacing.m },
  popularCardWrapper: { marginRight: Spacing.m },
  categoryFallbackTitle: { fontSize: 22, fontWeight: '700', color: Colors.light.text, paddingHorizontal: Spacing.m }
});

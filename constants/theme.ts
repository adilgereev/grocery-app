/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#10B981';
const tintColorDark = '#10B981';

export const Colors = {
  light: {
    primary: tintColorLight,
    primaryDark: '#059669',
    primaryLight: '#F0FDF4',
    primaryBorder: '#D1FAE5',
    background: '#F9FAFB',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    info: '#3B82F6',
    infoLight: '#EEF2FF',
    success: '#16A34A',
    successLight: '#F0FDF4',
    secondary: '#8B5CF6',
    secondaryLight: '#F5F3FF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    // Disabled/Readonly поля
    disabledBackground: '#F3F4F6',
    disabledText: '#9CA3AF',
    // Прозрачные цвета
    whiteTransparent: 'rgba(255,255,255,0.25)',
    blackTransparent: 'rgba(0,0,0,0.1)',
    white: '#ffffff',
    black: '#000000',
  },
  dark: {
    primary: tintColorDark,
    primaryDark: '#065F46',
    primaryLight: '#064E3B',
    primaryBorder: '#065F46',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textLight: '#6B7280',
    border: '#374151',
    borderLight: '#1F2937',
    error: '#F87171',
    errorLight: '#450A0A',
    warning: '#FBBF24',
    warningLight: '#451A03',
    info: '#60A5FA',
    infoLight: '#1E1B4B',
    success: '#34D399',
    successLight: '#064E3B',
    secondary: '#A78BFA',
    secondaryLight: '#2E1065',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    // Disabled/Readonly поля
    disabledBackground: '#2D3748',
    disabledText: '#9CA3AF',
    // Прозрачные цвета
    whiteTransparent: 'rgba(255,255,255,0.15)',
    blackTransparent: 'rgba(0,0,0,0.3)',
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const Radius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

export const FontSize = {
  xs: 10,
  s: 12,
  m: 14,
  l: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  big: 28,
  huge: 32,
  hero: 48,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

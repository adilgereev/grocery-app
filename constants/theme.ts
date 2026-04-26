/**
 * Ниже приведены цвета, используемые в приложении. Цвета определены для светлой и темной тем.
 * Существует множество других способов стилизации приложения. Например, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app) и т.д.
 */

import { Platform } from 'react-native';

const tintColorLight = '#10B981';

export const Colors = {
  light: {
    primary: tintColorLight,
    primaryDark: '#059669',
    primaryLight: '#F0FDF4',
    primaryBorder: '#D1FAE5',
    // Тёмно-зелёный акцент для CTA-кнопок ("В корзину", "Оформить заказ")
    cta: '#059669',
    ctaDark: '#047857',
    background: '#F9FAFB',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warning: '#F97316',
    warningLight: '#FFF7ED',
    warningText: '#92400e',
    info: '#3B82F6',
    infoLight: '#EEF2FF',
    success: '#16A34A',
    successLight: '#F0FDF4',
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
    // Стеклянные эффекты (Glassmorphism)
    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  s: 8,
  sm: 12,
  m: 16,
  ml: 20,
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
  pill: 100,
};

export const Duration = {
  fast: 150,      // микро-анимации (наведение, нажатие)
  default: 300,   // карточки, переходы, всплывающие уведомления
  slow: 500,      // полноэкранные переходы
  pulse: 800,     // мерцание скелетона (shimmer)
};

export const Shadows = {
  sm: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 0,
  },
  md: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 0,
  },
  lg: {
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 0,
  },
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
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CartRecommendations from '@/components/cart/CartRecommendations';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';

interface EmptyCartProps {
  insetsTop: number;
}

/**
 * Компонент пустой корзины с автономным блоком рекомендованных товаров.
 */
export default function EmptyCart({ insetsTop }: EmptyCartProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insetsTop + Spacing.m }]}>
        <Text style={styles.headerTitle}>Корзина</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.emptyScrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyHeader}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="cart-outline" size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.emptyTitle}>В корзине пусто</Text>
          <Text style={styles.emptySubText}>Посмотрите популярные товары или перейдите в каталог</Text>

          <TouchableOpacity 
            style={styles.goShoppingBtn} 
            onPress={() => router.push('/(tabs)/(index)')}
            activeOpacity={0.8}
            testID="cart-go-shopping-btn"
          >
            <Text style={styles.goShoppingBtnText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>

        <CartRecommendations />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: Colors.light.background,
    paddingBottom: Spacing.s,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptyScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  emptyHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.s,
  },
  emptySubText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.l,
    lineHeight: 22,
  },
  goShoppingBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    ...Shadows.md,
  },
  goShoppingBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { logger } from '@/lib/logger';
import ProductCard from '@/components/product/ProductCard';
import { Spacing, FontSize, Colors } from '@/constants/theme';

/**
 * Блок рекомендаций для пустой корзины.
 * Вынесен из основного экрана для оптимизации и чистоты кода.
 */
export default function CartRecommendations() {
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(6);

      if (error) throw error;
      if (data) setRecommended(data);
    } catch (err) {
      logger.error('Ошибка загрузки рекомендаций в корзине:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.light.primary} />
      </View>
    );
  }

  if (recommended.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Может быть интересно?</Text>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard item={item} />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={170 + Spacing.m} // Ширина карточки + отступ
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  loaderContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 15,
  },
  cardWrapper: {
    width: 170,
    marginHorizontal: 5,
  },
});

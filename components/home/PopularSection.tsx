import { Product } from '@/types';
import { Duration } from '@/constants/theme';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import PopularProductsSkeleton from '@/components/product/PopularProductsSkeleton';
import ProductCard from '@/components/product/ProductCard';
import { homeStyles as s } from './index.styles';

interface PopularSectionProps {
  products: Product[];
  loading: boolean;
  onProductPress: (productId: string) => void;
  onSeeAll?: () => void;
}

export default function PopularSection({
  products,
  loading,
  onProductPress,
  onSeeAll,
}: PopularSectionProps) {
  if (loading && products.length === 0) {
    return <PopularProductsSkeleton count={5} />;
  }
  if (products.length === 0 && !loading) {
    return (
      <View style={s.popularSection}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>🔥 Популярное</Text>
        </View>
        <Text style={s.emptyText}>Скоро здесь появятся популярные товары</Text>
      </View>
    );
  }

  return (
    <View style={s.popularSection}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>🔥 Популярное</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} testID="home-popular-see-all">
          <Text style={s.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>
      <Animated.View key={String(loading)} entering={FadeIn.duration(Duration.default)}>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.popularScroll}
          testID="home-popular-scroll"
        >
          {products.map((product, index) => (
            <View key={product.id} style={s.popularCardWrapper}>
              <ProductCard
                item={product}
                index={index}
                onPress={() => onProductPress(product.id)}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

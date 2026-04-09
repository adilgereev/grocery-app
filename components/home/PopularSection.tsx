import { Product } from '@/types';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PopularProductsSkeleton from '@/components/product/PopularProductsSkeleton';
import ProductCard from '@/components/product/ProductCard';
import { homeStyles as s } from './index.styles';

interface PopularSectionProps {
  products: Product[];
  loading: boolean;
  onProductPress: (productId: string) => void;
}

export default function PopularSection({
  products,
  loading,
  onProductPress,
}: PopularSectionProps) {
  if (loading && products.length === 0) {
    return <PopularProductsSkeleton count={5} />;
  }
  if (products.length === 0 && !loading) return null;

  return (
    <View style={s.popularSection}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>🔥 Популярное</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>
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
    </View>
  );
}

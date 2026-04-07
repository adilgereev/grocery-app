import { Colors, Duration } from '@/constants/theme';
import { Product } from '@/types';
import { getOptimizedImage, getPlaceholderUrl } from '@/utils/imageKit';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PopularProductsSkeleton from '@/components/product/PopularProductsSkeleton';
import { homeStyles as s } from './index.styles';

interface PopularSectionProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
  onProductPress: (productId: string) => void;
}

export default function PopularSection({
  products,
  loading,
  onAddToCart,
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
        {products.map((product) => (
          <TouchableOpacity
            key={product.id} style={s.popularCard} activeOpacity={0.8}
            onPress={() => onProductPress(product.id)}
            testID={`home-popular-product-${product.id}`}
          >
            <View style={s.imageWrapper}>
              {product.image_url
                ? (
                  <Image
                    source={getOptimizedImage(product.image_url, { width: 140, height: 110 })}
                    placeholder={getPlaceholderUrl(product.image_url)}
                    style={s.popularImage}
                    contentFit="cover"
                    transition={Duration.default}
                  />
                ) : <View style={[s.popularImage, s.imagePlaceholder]} />
              }
              <TouchableOpacity
                style={s.addPopularButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                activeOpacity={0.9}
                testID={`home-popular-add-${product.id}`}
              >
                <Ionicons name="add" size={20} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
            <View style={s.popularInfo}>
              <Text style={s.popularName} numberOfLines={1}>{product.name}</Text>
              <Text style={s.popularPrice}>
                {product.price} ₽<Text style={s.popularUnit}> / {product.unit}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

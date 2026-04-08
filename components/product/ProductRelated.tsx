import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { Product } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { useImageKit } from '@/hooks/useImageKit';

/** Карточка одного рекомендуемого товара */
const RelatedProductCard = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const { source, placeholder, hasImage, imageProps } = useImageKit(item.image_url, { width: 140, height: 110 });

  return (
    <TouchableOpacity
      style={styles.relatedCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {hasImage ? (
        <Image
          source={source}
          placeholder={placeholder}
          style={styles.relatedImage}
          {...imageProps}
        />
      ) : (
        <View style={[styles.relatedImage, { backgroundColor: Colors.light.borderLight }]} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.relatedPrice}>{Number(item.price).toFixed(0)} ₽</Text>
      </View>
    </TouchableOpacity>
  );
};

interface ProductRelatedProps {
  products: Product[];
  isLoading: boolean;
  onProductPress: (item: Product) => void;
}

/**
 * Секция с похожими/рекомендуемыми товарами
 */
export const ProductRelated: React.FC<ProductRelatedProps> = ({ products, isLoading, onProductPress }) => {
  if (!isLoading && products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>С этим покупают</Text>
      {isLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScrollContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRelatedItem}>
              <Skeleton width={140} height={190} borderRadius={20} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedScrollContent}
        >
          {products.map((item) => (
            <RelatedProductCard key={item.id} item={item} onPress={() => onProductPress(item)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  relatedScrollContent: {
    paddingRight: Spacing.l,
  },
  relatedCard: {
    width: 140,
    marginRight: Spacing.m,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Shadows.sm,
  },
  relatedImage: {
    width: '100%',
    height: 110,
    borderRadius: Radius.m,
    backgroundColor: Colors.light.border,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  relatedPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  skeletonRelatedItem: {
    marginRight: Spacing.m,
  },
});

import Skeleton from '@/components/Skeleton';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProductRelatedProps {
  products: Product[];
  isLoading: boolean;
}

/**
 * Секция с похожими/рекомендуемыми товарами
 */
export const ProductRelated: React.FC<ProductRelatedProps> = ({ products, isLoading }) => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>С этим покупают</Text>
      {!isLoading && products.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedScrollContent}
        >
          {products.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.relatedCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${item.id}?name=${encodeURIComponent(item.name)}` as any)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.relatedImage} />
              ) : (
                <View style={[styles.relatedImage, { backgroundColor: Colors.light.borderLight }]} />
              )}
              <View style={styles.infoContainer}>
                <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.relatedPrice}>{Number(item.price).toFixed(0)} ₽</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScrollContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRelatedItem}>
              <Skeleton width={140} height={190} borderRadius={20} />
            </View>
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
    elevation: 2,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    fontWeight: '900',
    color: Colors.light.text,
  },
  skeletonRelatedItem: {
    marginRight: Spacing.m,
  },
});

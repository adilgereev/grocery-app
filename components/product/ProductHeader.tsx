import { Colors, Spacing } from '@/constants/theme';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductHeaderProps {
  product: Product;
  isFavorite: boolean;
  onFavoritePress: () => void;
}

/**
 * Заголовок карточки товара с изображением и кнопками действий
 */
export const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  isFavorite,
  onFavoritePress,
}) => {
  const router = useRouter();

  return (
    <View style={styles.imageContainer}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholderImage]} />
      )}

      <SafeAreaView edges={['top']} style={styles.headerAbsolute}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onFavoritePress} style={styles.iconButton}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? Colors.light.error : Colors.light.text}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: Colors.light.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.light.border,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.whiteTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});

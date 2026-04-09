import { Colors, Radius, Spacing, Duration, Shadows } from '@/constants/theme';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useImageKit } from '@/hooks/useImageKit';
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
  const { width: screenWidth } = useWindowDimensions();
  const { source, placeholder, hasImage, imageProps } = useImageKit(product.image_url, { width: screenWidth, height: 380, transition: Duration.slow });

  return (
    <View style={styles.imageContainer}>
      {hasImage ? (
        <Image
          source={source}
          placeholder={placeholder}
          style={styles.image}
          {...imageProps}
        />
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
            color={isFavorite ? Colors.light.primary : Colors.light.text}
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
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.whiteTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
});

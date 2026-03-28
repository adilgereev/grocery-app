import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Product } from '@/types';

// Вычисляем половину ширины экрана минус отступы по краям (32) и между колонками (16)
const { width } = Dimensions.get('window');
const cardWidth = (width - 32 - 16) / 2; 

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ProductCard({ item, index = 0 }: { item: Product, index?: number }) {
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCartStore();

  const cartItem = items.find((i) => i.product.id === item.id);

  return (
    <AnimatedTouchable 
      style={[styles.productCard, { width: cardWidth }]}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item.id}?name=${encodeURIComponent(item.name)}`)}
      entering={FadeInDown.delay(index * 50).duration(400)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, { backgroundColor: Colors.light.border }]} />
      )}
      
      <View style={styles.productInfo}>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice} numberOfLines={1}>
             {Number(item.price).toFixed(0)} ₽
          </Text>
          <Text style={styles.productUnit}>/ {item.unit}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      </View>
      
      <View style={styles.actionContainer}>
        {!cartItem ? (
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => addItem(item)}>
            <Ionicons name="cart" size={22} color={Colors.light.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControlContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
            
            <Text style={styles.controlQuantity}>{cartItem.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              activeOpacity={0.7}
              onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flexDirection: 'column',
    backgroundColor: Colors.light.card,
    borderRadius: Radius.xxl,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    shadowColor: Colors.light.text,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.l,
    marginBottom: Spacing.s,
    backgroundColor: Colors.light.borderLight,
  },
  productInfo: {
    flex: 1,
    marginBottom: Spacing.s,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  productUnit: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginLeft: 4,
    fontWeight: '600',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 'auto',
  },
  addButton: {
    width: '100%',
    height: 40,
    borderRadius: Radius.m,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControlContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.m,
    height: 40,
    paddingHorizontal: Spacing.xs,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.s,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlQuantity: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.card,
    marginHorizontal: Spacing.xs,
  },
});

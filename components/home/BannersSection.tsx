import { Colors, Duration } from '@/constants/theme';
import { mockBanners } from '@/data/mockBanners';
import { getOptimizedImage, getPlaceholderUrl } from '@/utils/imageKit';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { homeStyles as s } from './index.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BannersSection() {
  return (
    <View style={s.bannersSection}>
      <Text style={s.bannersTitle}>Акции и новинки</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.bannersScroll}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH * 0.8 + 16}
        testID="home-banners-scroll"
      >
        {mockBanners.map((banner) => (
          <TouchableOpacity key={banner.id} style={s.bannerCard} activeOpacity={0.9}>
            <View style={s.bannerImageContainer}>
              <Image
                source={getOptimizedImage(banner.image_url, { width: Math.round(SCREEN_WIDTH * 0.8), height: 160 })}
                placeholder={getPlaceholderUrl(banner.image_url)}
                style={s.bannerImage}
                contentFit="cover"
                transition={Duration.slow}
              />
              <LinearGradient
                colors={[Colors.light.blackTransparent, 'transparent']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0.4 }}
                style={s.gradientOverlay}
              />
              <Text style={s.bannerTitle}>{banner.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

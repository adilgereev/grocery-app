import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Свежие продукты\nкаждый день',
    description: 'Мы тщательно отбираем лучшие овощи, фрукты и фермерские продукты специально для вас.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Быстрая доставка\nдо двери',
    description: 'Наши курьеры доставят ваш заказ от 15 минут. Прямо к вашей двери в лучшем виде.',
    image: 'https://images.unsplash.com/photo-1617196034738-26c5f7c07c10?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Огромный выбор\nи скидки',
    description: 'Более 10 000 товаров, ежедневные акции и приятные бонусы для постоянных клиентов.',
    image: 'https://images.unsplash.com/photo-1583258292688-d0ed0e0c043a?auto=format&fit=crop&q=80&w=800',
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const setHasSeenOnboarding = useAppStore(state => state.setHasSeenOnboarding);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  const updateCurrentSlideIndex = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const scrollIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(scrollIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity style={styles.skipTextButton} onPress={handleSkip}>
          <Text style={styles.skipTextTop}>Пропустить</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        contentContainerStyle={{ paddingBottom: 10 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        pagingEnabled
        bounces={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            
            <View style={styles.content}>
               <Text style={styles.title}>{item.title}</Text>
               <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                currentIndex === index ? styles.activeIndicator : null
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, currentIndex === slides.length - 1 && styles.startBtn]} 
          activeOpacity={0.8}
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? (
            <Text style={styles.btnText}>Начать</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  skipTextButton: {
    padding: 10,
  },
  skipTextTop: {
    fontSize: 16,
    color: Colors.light.textLight,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width - 40,
    height: height * 0.35,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: Spacing.l,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.m,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
    paddingBottom: Platform.OS === 'android' ? 40 : 40,
    paddingTop: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: Colors.light.border,
    borderRadius: Radius.xs,
    marginRight: Spacing.s,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: Colors.light.primary,
  },
  nextButton: {
    height: 60,
    minWidth: 60,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  startBtn: {
    paddingHorizontal: 30,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

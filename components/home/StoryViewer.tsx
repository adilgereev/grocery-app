import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { Story } from '@/types';
import { getOptimizedImage } from '@/lib/utils/imageKit';

const { width: W, height: H } = Dimensions.get('window');
// Длительность одной сторис в миллисекундах
const STORY_DURATION = 5000;
// Минимальный сдвиг вниз для закрытия
const SWIPE_CLOSE_THRESHOLD = 100;

interface Props {
  stories: Story[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onViewed: (storyId: string) => void;
}

export default function StoryViewer({
  stories,
  initialIndex,
  visible,
  onClose,
  onViewed,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  // Анимация свайпа вниз
  const swipeY = useRef(new Animated.Value(0)).current;
  const swipeOpacity = swipeY.interpolate({
    inputRange: [0, H * 0.45],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const story = stories[currentIndex];

  const handleClose = useCallback(() => {
    Animated.timing(swipeY, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
    onClose();
  }, [onClose, swipeY]);

  // Переход к следующей сторис или закрытие просмотрщика
  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleClose();
    }
  }, [currentIndex, stories.length, handleClose]);

  // Переход к предыдущей сторис
  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // PanResponder для свайпа вниз
  const panResponder = useRef(
    PanResponder.create({
      // Захватываем жест только при явном движении вниз (не горизонтальный тап)
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 12 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) swipeY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > SWIPE_CLOSE_THRESHOLD) {
          // Улетаем вниз и закрываем
          Animated.timing(swipeY, {
            toValue: H,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            swipeY.setValue(0);
            onClose();
          });
        } else {
          // Возвращаемся на место
          Animated.spring(swipeY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Сброс позиции и индекса при открытии
  useEffect(() => {
    if (visible) {
      swipeY.setValue(0);
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex, swipeY]);

  // Запуск анимации прогресса при смене сторис
  useEffect(() => {
    if (!visible || !story) return;

    onViewed(story.id);
    progressAnim.setValue(0);
    animRef.current?.stop();

    animRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      if (finished) goNext();
    });

    return () => {
      animRef.current?.stop();
    };
  }, [currentIndex, visible, story, goNext, onViewed, progressAnim]);

  if (!story) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      testID="story-viewer-modal"
    >
      {/* Фиксированный чёрный фон — не движется при свайпе */}
      <View style={s.backdrop} />

      <Animated.View
        style={[s.container, { transform: [{ translateY: swipeY }], opacity: swipeOpacity }]}
        {...panResponder.panHandlers}
      >
        {/* Фоновое изображение */}
        <Image
          source={getOptimizedImage(story.image_url, { width: W })}
          style={s.image}
          contentFit="cover"
        />

        {/* Градиент сверху — для читаемости полос прогресса */}
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent']}
          style={s.topGradient}
        />

        {/* Градиент снизу — для читаемости заголовка */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          style={s.bottomGradient}
        />

        {/* Полосы прогресса */}
        <View style={s.progressContainer}>
          {stories.map((_, i) => {
            const width = i < currentIndex
              ? '100%'
              : i === currentIndex
                ? progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
                : '0%';

            return (
              <View key={i} style={s.progressTrack}>
                <Animated.View
                  style={[s.progressFill, { width }]}
                />
              </View>
            );
          })}
        </View>

        {/* Кнопка закрытия */}
        <TouchableOpacity
          style={s.closeButton}
          onPress={handleClose}
          testID="story-close-btn"
        >
          <Ionicons name="close" size={28} color={Colors.light.white} />
        </TouchableOpacity>

        {/* Бейдж типа сторис */}
        <View style={[s.badge, story.type === 'promo' ? s.badgePromo : s.badgeNew]}>
          <Text style={s.badgeText}>
            {story.type === 'promo' ? 'АКЦИЯ' : 'НОВИНКА'}
          </Text>
        </View>

        {/* Заголовок и подзаголовок */}
        <View style={s.textContainer}>
          <Text style={s.title}>{story.title}</Text>
          {story.subtitle ? (
            <Text style={s.subtitle}>{story.subtitle}</Text>
          ) : null}
        </View>

        {/* Зона нажатия — назад (левая треть экрана) */}
        <TouchableOpacity
          style={s.leftZone}
          onPress={goPrev}
          activeOpacity={1}
          testID="story-prev-btn"
        />

        {/* Зона нажатия — вперёд (правые две трети экрана) */}
        <TouchableOpacity
          style={s.rightZone}
          onPress={goNext}
          activeOpacity={1}
          testID="story-next-btn"
        />
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.light.black },
  container: { flex: 1 },
  image: { ...StyleSheet.absoluteFillObject },
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 150,
  },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 240,
  },
  // Полосы прогресса (под safe area — отступ 52 от верха)
  progressContainer: {
    position: 'absolute',
    top: 52,
    left: Spacing.m,
    right: Spacing.m,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: Colors.light.whiteTransparent,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.white,
  },
  closeButton: {
    position: 'absolute',
    top: 64,
    right: Spacing.m,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 70,
    left: Spacing.m,
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgePromo: { backgroundColor: Colors.light.cta },
  badgeNew: { backgroundColor: Colors.light.info },
  badgeText: {
    color: Colors.light.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  textContainer: {
    position: 'absolute',
    bottom: 80,
    left: Spacing.m,
    right: Spacing.m,
  },
  title: {
    color: Colors.light.white,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.light.white,
    fontSize: FontSize.m,
    fontWeight: '500',
    opacity: 0.85,
  },
  // Зоны нажатия (поверх контента, но не перекрывают кнопку закрытия)
  leftZone: {
    position: 'absolute',
    left: 0,
    top: 110,
    bottom: 0,
    width: W * 0.35,
  },
  rightZone: {
    position: 'absolute',
    right: 0,
    top: 110,
    bottom: 0,
    width: W * 0.65,
  },
});

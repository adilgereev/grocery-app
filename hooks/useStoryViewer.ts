import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, PanResponderInstance } from 'react-native';
import { Story } from '@/types';

const { width: W, height: H } = Dimensions.get('window');
const STORY_DURATION = 5000;
const SWIPE_CLOSE_THRESHOLD = 100;

interface UseStoryViewerProps {
  stories: Story[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onViewed: (storyId: string) => void;
}

interface UseStoryViewerReturn {
  currentIndex: number;
  story: Story | undefined;
  progressAnim: Animated.Value;
  swipeY: Animated.Value;
  swipeOpacity: Animated.AnimatedInterpolation<number>;
  panResponder: PanResponderInstance;
  goNext: () => void;
  goPrev: () => void;
  handleClose: () => void;
}

export function useStoryViewer({
  stories,
  initialIndex,
  visible,
  onClose,
  onViewed,
}: UseStoryViewerProps): UseStoryViewerReturn {
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
  const panResponderRef = useRef(
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

  return {
    currentIndex,
    story,
    progressAnim,
    swipeY,
    swipeOpacity,
    panResponder: panResponderRef,
    goNext,
    goPrev,
    handleClose,
  };
}

import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Story } from '@/types';
import { getOptimizedImage } from '@/lib/utils/imageKit';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import StoryProgressBars from './StoryProgressBars';
import StoryBadge from './StoryBadge';
import StoryTextContent from './StoryTextContent';
import StoryTapZones from './StoryTapZones';

const { width: W } = Dimensions.get('window');

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
  const {
    currentIndex,
    story,
    progressAnim,
    swipeY,
    swipeOpacity,
    panResponder,
    goNext,
    goPrev,
    handleClose,
  } = useStoryViewer({
    stories,
    initialIndex,
    visible,
    onClose,
    onViewed,
  });

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

        <StoryProgressBars
          stories={stories}
          currentIndex={currentIndex}
          progressAnim={progressAnim}
        />

        {/* Кнопка закрытия */}
        <TouchableOpacity
          style={s.closeButton}
          onPress={handleClose}
          testID="story-close-btn"
        >
          <Ionicons name="close" size={28} color={Colors.light.white} />
        </TouchableOpacity>

        <StoryBadge type={story.type} />

        <StoryTextContent title={story.title} subtitle={story.subtitle} />

        <StoryTapZones onPrev={goPrev} onNext={goNext} />
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
  closeButton: {
    position: 'absolute',
    top: 64,
    right: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

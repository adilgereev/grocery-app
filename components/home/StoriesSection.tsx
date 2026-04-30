import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useStoriesStore } from '@/store/storiesStore';
import Skeleton from '@/components/ui/Skeleton';
import StoryViewer from './StoryViewer';
import { homeStyles as s } from './index.styles';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_W = Math.floor((SCREEN_WIDTH - Spacing.m * 2 - Spacing.s * 2) / 3);
const IMG_H = Math.floor(ITEM_W * 1.25);

export default function StoriesSection() {
  const { stories, isLoading, markAsViewed, isViewed } = useStoriesStore();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openStory = useCallback((index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerVisible(false);
  }, []);

  // Не рендерим блок, если данных нет и загрузка завершена
  if (!isLoading && stories.length === 0) return null;

  return (
    <View style={s.storiesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.storiesScroll}
        testID="home-stories-scroll"
      >
        {isLoading && stories.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={s.storyItem}>
                <Skeleton width={ITEM_W} height={IMG_H} borderRadius={Radius.xl}
                          style={{ marginBottom: Spacing.xs }} />
                <Skeleton width={ITEM_W * 0.7} height={8} borderRadius={Radius.s} />
              </View>
            ))
          : stories.map((story, i) => {
              const viewed = isViewed(story.id);
              return (
                <TouchableOpacity
                  key={story.id}
                  style={s.storyItem}
                  onPress={() => openStory(i)}
                  activeOpacity={0.8}
                  testID={`story-item-${story.id}`}
                >
                  {viewed ? (
                    // Просмотренная сторис — серая рамка
                    <View style={s.storyWatchedBorder}>
                      <View style={s.storyInnerBorder}>
                        <Image
                          source={{ uri: story.image_url }}
                          style={s.storyImage}
                          contentFit="cover"
                        />
                      </View>
                    </View>
                  ) : (
                    // Непросмотренная сторис — изумрудная градиентная рамка
                    <LinearGradient
                      colors={[Colors.light.primary, Colors.light.cta]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s.storyGradientBorder}
                    >
                      <View style={s.storyInnerBorder}>
                        <Image
                          source={{ uri: story.image_url }}
                          style={s.storyImage}
                          contentFit="cover"
                        />
                      </View>
                    </LinearGradient>
                  )}

                  <Text
                    style={[s.storyTitle, viewed && s.storyTitleWatched]}
                    numberOfLines={2}
                  >
                    {story.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
      </ScrollView>

      <StoryViewer
        stories={stories}
        initialIndex={selectedIndex}
        visible={viewerVisible}
        onClose={closeViewer}
        onViewed={markAsViewed}
      />
    </View>
  );
}

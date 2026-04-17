import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

const { width: W } = Dimensions.get('window');

interface Props {
  onPrev: () => void;
  onNext: () => void;
}

export default function StoryTapZones({ onPrev, onNext }: Props) {
  return (
    <>
      {/* Зона нажатия — назад (левая треть экрана) */}
      <TouchableOpacity
        style={s.leftZone}
        onPress={onPrev}
        activeOpacity={1}
        testID="story-prev-btn"
      />

      {/* Зона нажатия — вперёд (правые две трети экрана) */}
      <TouchableOpacity
        style={s.rightZone}
        onPress={onNext}
        activeOpacity={1}
        testID="story-next-btn"
      />
    </>
  );
}

const s = StyleSheet.create({
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

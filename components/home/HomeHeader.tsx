import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { homeStyles as s } from './index.styles';

interface HomeHeaderProps {
  firstName: string;
  greeting: { text: string; emoji: string };
  displayAddress: string;
  greetingHeight: Animated.AnimatedInterpolation<number>;
  greetingOpacity: Animated.AnimatedInterpolation<number>;
  onSearchPress: () => void;
  onAddressPress: () => void;
}

export default function HomeHeader({
  firstName,
  greeting,
  displayAddress,
  greetingHeight,
  greetingOpacity,
  onSearchPress,
  onAddressPress,
}: HomeHeaderProps) {
  return (
    <View style={s.header}>
      {/* Анимированная строка приветствия + адрес */}
      <Animated.View style={[s.greetingAnimationContainer, { height: greetingHeight, opacity: greetingOpacity }]}>
        <View style={s.greetingContainer}>
          <Text style={s.greetingText}>
            {firstName ? `${greeting.text}, ${firstName}! ${greeting.emoji}` : `${greeting.text}! ${greeting.emoji}`}
          </Text>
          <TouchableOpacity
            style={s.addressRow}
            activeOpacity={0.7}
            onPress={onAddressPress}
            testID="home-address-button"
          >
            <Ionicons name="location" size={14} color={Colors.light.primary} />
            <Text style={s.addressText} numberOfLines={1}>
              {displayAddress}
            </Text>
            <Ionicons name="chevron-down" size={14} color={Colors.light.textLight} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Строка поиска — всегда видна */}
      <TouchableOpacity
        style={s.searchContainer}
        activeOpacity={0.8}
        onPress={onSearchPress}
        testID="home-search-button"
      >
        <Ionicons name="search" size={20} color={Colors.light.textLight} style={s.searchIcon} />
        <Text style={s.searchInputText}>Поиск</Text>
      </TouchableOpacity>
    </View>
  );
}

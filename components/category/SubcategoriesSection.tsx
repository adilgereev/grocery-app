import React, { useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import SubcategoryCard from './SubcategoryCard';
import { Colors, Spacing } from '@/constants/theme';
import { getMosaicCardWidth } from '@/lib/utils/mosaicLayout';
import { Category } from '@/types';

interface SubcategoriesSectionProps {
  subcategories: Category[];
  onSubcategoryPress: (id: string, name: string) => void;
}

export default function SubcategoriesSection({
  subcategories,
  onSubcategoryPress,
}: SubcategoriesSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - Spacing.m * 2;
  const GAP = 8;

  const handlePress = useCallback((subcatId: string, subcatName: string) => {
    onSubcategoryPress(subcatId, subcatName);
  }, [onSubcategoryPress]);

  if (subcategories.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Подкатегории</Text>
      <View style={styles.row}>
        {subcategories.map((item, index) => {
          const cardWidth = getMosaicCardWidth(
            index,
            subcategories.length,
            containerWidth,
            GAP
          );
          return (
            <SubcategoryCard
              key={item.id}
              subcategory={item}
              cardWidth={cardWidth}
              index={index}
              onPress={() => handlePress(item.id, item.name)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 8,
    rowGap: 8,
  },
});

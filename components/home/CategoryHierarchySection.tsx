import { Colors, Spacing } from '@/constants/theme';
import { CategoryWithSubcategories } from '@/types';
import { getMosaicCardWidth } from '@/utils/mosaicLayout';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import SubcategoryCard from '@/components/category/SubcategoryCard';

interface CategoryHierarchySectionProps {
  category: CategoryWithSubcategories;
}

const CategoryHierarchySection = React.memo(({ category }: CategoryHierarchySectionProps) => {
  const { subcategories } = category;
  const { width: windowWidth } = useWindowDimensions();

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  const containerWidth = windowWidth - Spacing.m * 2;
  const GAP = 8; // Фиксированный зазор по просьбе пользователя

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.name}</Text>
      <View style={styles.mosaicContainer}>
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
            />
          );
        })}
      </View>
    </View>
  );
});
CategoryHierarchySection.displayName = 'CategoryHierarchySection';

export default CategoryHierarchySection;

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  mosaicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    columnGap: 8, // Прецизионный зазоров по Лавке
    rowGap: 8, // Прецизионный зазоров по Лавке
  },
});

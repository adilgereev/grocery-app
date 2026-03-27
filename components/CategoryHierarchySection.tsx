import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { CategoryWithSubcategories } from '@/types';
import SubcategoryCard from './SubcategoryCard';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface CategoryHierarchySectionProps {
  category: CategoryWithSubcategories;
}

const CategoryHierarchySection = React.memo(({ category }: CategoryHierarchySectionProps) => {
  const { subcategories } = category;

  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.name}</Text>
      <View style={styles.mosaicContainer}>
        {subcategories.map((item, index) => (
          <SubcategoryCard key={item.id} subcategory={item} index={index} />
        ))}
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
    fontWeight: '900',
    color: Colors.light.text,
    marginBottom: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  mosaicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    rowGap: Spacing.m,
  },
});

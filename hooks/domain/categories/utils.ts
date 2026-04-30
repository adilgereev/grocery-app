import { Category } from '@/types';

/**
 * Чистая функция для иерархической сортировки категорий.
 * Сначала идут родители, затем их дети.
 */
export function sortHierarchically(allCategories: Category[]): Category[] {
  const roots = allCategories
    .filter((c) => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const sorted: Category[] = [];
  const usedIds = new Set<string>();

  roots.forEach((parent) => {
    sorted.push(parent);
    usedIds.add(parent.id);
    const children = allCategories
      .filter((c) => c.parent_id === parent.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    children.forEach((child) => {
      sorted.push(child);
      usedIds.add(child.id);
    });
  });

  const orphans = allCategories.filter((c) => !usedIds.has(c.id));
  sorted.push(...orphans);
  return sorted;
}

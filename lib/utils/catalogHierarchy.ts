import { Category, ProductWithCategory } from '@/types';

export type RootHeaderItem = { type: 'root_header'; id: string; title: string; count: number };
export type SubHeaderItem = { type: 'sub_header'; id: string; title: string; count: number };
export type ProductItem = { type: 'product'; product: ProductWithCategory };
export type CatalogItem = RootHeaderItem | SubHeaderItem | ProductItem;

export function buildHierarchy(
  products: ProductWithCategory[],
  categories: Category[],
): CatalogItem[] {
  const roots = categories
    .filter(c => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const items: CatalogItem[] = [];
  const usedIds = new Set<string>();

  roots.forEach(root => {
    const directProducts = products.filter(p => p.category_id === root.id);
    const subcategories = categories
      .filter(c => c.parent_id === root.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const subProducts = subcategories.flatMap(sub =>
      products.filter(p => p.category_id === sub.id)
    );

    const totalCount = directProducts.length + subProducts.length;
    if (totalCount === 0) return;

    items.push({ type: 'root_header', id: root.id, title: root.name, count: totalCount });

    directProducts.forEach(p => {
      items.push({ type: 'product', product: p });
      usedIds.add(p.id);
    });

    subcategories.forEach(sub => {
      const prods = products.filter(p => p.category_id === sub.id);
      if (prods.length === 0) return;
      items.push({ type: 'sub_header', id: sub.id, title: sub.name, count: prods.length });
      prods.forEach(p => {
        items.push({ type: 'product', product: p });
        usedIds.add(p.id);
      });
    });
  });

  const orphans = products.filter(p => !usedIds.has(p.id));
  if (orphans.length > 0) {
    items.push({ type: 'root_header', id: '__none__', title: 'Без категории', count: orphans.length });
    orphans.forEach(p => items.push({ type: 'product', product: p }));
  }

  return items;
}

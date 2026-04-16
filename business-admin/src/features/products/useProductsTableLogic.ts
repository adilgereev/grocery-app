import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteProduct, updateProduct } from "@/lib/adminApi";
import type { Category, ProductWithCategory } from "@/types";

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

export function useProductsTableLogic(
  products: ProductWithCategory[],
  categories: Category[],
  onDeleted: (id: string) => void,
) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);
  const [collapsedRoots, setCollapsedRoots] = useState<Set<string>>(new Set());
  const [collapsedSubs, setCollapsedSubs] = useState<Set<string>>(new Set());

  function toggleRoot(id: string) {
    setCollapsedRoots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSub(id: string) {
    setCollapsedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const { rootCategories, subcatMap } = useMemo(() => {
    const roots = categories
      .filter((c) => c.parent_id === null)
      .sort((a, b) => a.sort_order - b.sort_order);

    const subcatMap = new Map<string, Category[]>();
    roots.forEach((root) => {
      subcatMap.set(
        root.id,
        categories
          .filter((c) => c.parent_id === root.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    });

    return { rootCategories: roots, subcatMap };
  }, [categories]);

  const productMap = useMemo(() => {
    let filtered = globalFilter
      ? products.filter((p) =>
          p.name.toLowerCase().includes(globalFilter.toLowerCase()),
        )
      : products;

    if (categoryFilter === "__none__") {
      filtered = filtered.filter((p) => p.category_id === null);
    } else if (categoryFilter !== "all") {
      const selected = categories.find((c) => c.id === categoryFilter);
      if (selected?.parent_id === null) {
        const subIds = new Set(
          categories
            .filter((c) => c.parent_id === categoryFilter)
            .map((c) => c.id),
        );
        filtered = filtered.filter(
          (p) =>
            p.category_id === categoryFilter || subIds.has(p.category_id ?? ""),
        );
      } else {
        filtered = filtered.filter((p) => p.category_id === categoryFilter);
      }
    }

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name, "ru") * dir;
      if (sortKey === "price") return (a.price - b.price) * dir;
      if (sortKey === "stock") return (a.stock - b.stock) * dir;
      return 0;
    });

    const map = new Map<string | null, ProductWithCategory[]>();
    for (const p of sorted) {
      const key = p.category_id ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [products, categories, globalFilter, categoryFilter, sortKey, sortDir]);

  const handleToggleActive = useCallback(
    async (product: ProductWithCategory) => {
      try {
        await updateProduct(product.id, { is_active: !product.is_active });
        toast.success(`Товар ${!product.is_active ? "активирован" : "скрыт"}`);
        product.is_active = !product.is_active;
      } catch {
        toast.error("Ошибка обновления");
      }
    },
    [],
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      onDeleted(deleteTarget.id);
      toast.success("Товар удалён");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "23503") {
        toast.error(
          "Нельзя удалить — товар есть в заказах. Скройте его через тогл «Активен».",
        );
      } else {
        toast.error("Ошибка удаления");
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  function countInBranch(rootId: string) {
    const subs = subcatMap.get(rootId) ?? [];
    return (
      (productMap.get(rootId)?.length ?? 0) +
      subs.reduce((sum, sub) => sum + (productMap.get(sub.id)?.length ?? 0), 0)
    );
  }

  const totalVisible = [...productMap.values()].reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return {
    sortKey,
    sortDir,
    globalFilter,
    categoryFilter,
    deleteTarget,
    collapsedRoots,
    collapsedSubs,
    rootCategories,
    subcatMap,
    productMap,
    totalVisible,
    toggleRoot,
    toggleSub,
    toggleSort,
    setGlobalFilter,
    setCategoryFilter,
    setDeleteTarget,
    handleToggleActive,
    handleDelete,
    countInBranch,
  };
}

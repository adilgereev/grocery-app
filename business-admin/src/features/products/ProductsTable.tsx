import { useMemo, useState, useCallback } from 'react';
import { ArrowUpDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { updateProduct, deleteProduct } from '@/lib/adminApi';
import type { ProductWithCategory, Category } from '@/types';

type SortKey = 'name' | 'price' | 'stock';
type SortDir = 'asc' | 'desc';

interface ProductsTableProps {
  products: ProductWithCategory[];
  categories: Category[];
  onEdit: (product: ProductWithCategory) => void;
  onDeleted: (id: string) => void;
}

const COLS = 7;

export function ProductsTable({ products, categories, onEdit, onDeleted }: ProductsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // Иерархия категорий
  const { rootCategories, subcatMap } = useMemo(() => {
    const roots = categories
      .filter(c => c.parent_id === null)
      .sort((a, b) => a.sort_order - b.sort_order);

    const subcatMap = new Map<string, Category[]>();
    roots.forEach(root => {
      subcatMap.set(
        root.id,
        categories
          .filter(c => c.parent_id === root.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    });

    return { rootCategories: roots, subcatMap };
  }, [categories]);

  // Фильтрация → сортировка → группировка по category_id
  const productMap = useMemo(() => {
    // 1. Текстовый фильтр
    let filtered = globalFilter
      ? products.filter(p => p.name.toLowerCase().includes(globalFilter.toLowerCase()))
      : products;

    // 2. Фильтр по категории
    if (categoryFilter === '__none__') {
      filtered = filtered.filter(p => p.category_id === null);
    } else if (categoryFilter !== 'all') {
      const selected = categories.find(c => c.id === categoryFilter);
      if (selected?.parent_id === null) {
        // Корневая выбрана: берём товары из неё и всех её подкатегорий
        const subIds = new Set(
          categories.filter(c => c.parent_id === categoryFilter).map(c => c.id),
        );
        filtered = filtered.filter(p =>
          p.category_id === categoryFilter || subIds.has(p.category_id ?? ''),
        );
      } else {
        filtered = filtered.filter(p => p.category_id === categoryFilter);
      }
    }

    // 3. Сортировка
    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'ru') * dir;
      if (sortKey === 'price') return (a.price - b.price) * dir;
      if (sortKey === 'stock') return (a.stock - b.stock) * dir;
      return 0;
    });

    // 4. Группировка по category_id (null — «Без категории»)
    const map = new Map<string | null, ProductWithCategory[]>();
    for (const p of sorted) {
      const key = p.category_id ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [products, categories, globalFilter, categoryFilter, sortKey, sortDir]);

  const handleToggleActive = useCallback(async (product: ProductWithCategory) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      toast.success(`Товар ${!product.is_active ? 'активирован' : 'скрыт'}`);
      product.is_active = !product.is_active;
    } catch {
      toast.error('Ошибка обновления');
    }
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      onDeleted(deleteTarget.id);
      toast.success('Товар удалён');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === '23503') {
        toast.error('Нельзя удалить — товар есть в заказах. Скройте его через тогл «Активен».');
      } else {
        toast.error('Ошибка удаления');
      }
    } finally {
      setDeleteTarget(null);
    }
  }

  // Количество товаров в ветке корневой категории (с учётом фильтров)
  function countInBranch(rootId: string) {
    const subs = subcatMap.get(rootId) ?? [];
    return (productMap.get(rootId)?.length ?? 0)
      + subs.reduce((sum, sub) => sum + (productMap.get(sub.id)?.length ?? 0), 0);
  }

  function renderRows(prods: ProductWithCategory[]) {
    return prods.map(p => (
      <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : undefined}>
        <TableCell>
          {p.image_url
            ? <img src={p.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
            : <div className="h-10 w-10 rounded-md bg-muted" />}
        </TableCell>
        <TableCell className="font-medium">{p.name}</TableCell>
        <TableCell>{p.price.toLocaleString('ru')} ₽</TableCell>
        <TableCell className="text-muted-foreground">{p.unit}</TableCell>
        <TableCell>
          <Badge variant={p.stock > 0 ? 'secondary' : 'destructive'}>{p.stock}</Badge>
        </TableCell>
        <TableCell>
          <Switch checked={p.is_active} onCheckedChange={() => handleToggleActive(p)} />
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(p)}>
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteTarget(p)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  const totalVisible = [...productMap.values()].reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-3">
      {/* Фильтры */}
      <div className="flex gap-3">
        <Input
          placeholder="Поиск по названию..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="__none__" className="text-muted-foreground">Без категории</SelectItem>
            {rootCategories.map(root => (
              <>
                <SelectItem key={root.id} value={root.id} className="font-semibold">
                  {root.name}
                </SelectItem>
                {(subcatMap.get(root.id) ?? []).map(sub => (
                  <SelectItem key={sub.id} value={sub.id} className="pl-7 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ChevronRight size={12} className="shrink-0" />
                      {sub.name}
                    </span>
                  </SelectItem>
                ))}
              </>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Иерархическая таблица */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>
                <button
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                  onClick={() => toggleSort('name')}
                >
                  Название
                  <ArrowUpDown size={14} className={sortKey === 'name' ? 'text-foreground' : 'text-muted-foreground'} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                  onClick={() => toggleSort('price')}
                >
                  Цена
                  <ArrowUpDown size={14} className={sortKey === 'price' ? 'text-foreground' : 'text-muted-foreground'} />
                </button>
              </TableHead>
              <TableHead>Единица</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                  onClick={() => toggleSort('stock')}
                >
                  Остаток
                  <ArrowUpDown size={14} className={sortKey === 'stock' ? 'text-foreground' : 'text-muted-foreground'} />
                </button>
              </TableHead>
              <TableHead className="w-20">Активен</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalVisible === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">
                  Товары не найдены
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rootCategories.map(root => {
                  if (countInBranch(root.id) === 0) return null;
                  const subs = subcatMap.get(root.id) ?? [];
                  const direct = productMap.get(root.id) ?? [];

                  return (
                    <>
                      {/* Заголовок корневой категории */}
                      <TableRow key={`root-${root.id}`} className="bg-muted/40 hover:bg-muted/40">
                        <TableCell colSpan={COLS} className="py-2">
                          <span className="font-semibold text-sm">{root.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {countInBranch(root.id)} товаров
                          </span>
                        </TableCell>
                      </TableRow>

                      {/* Товары напрямую в корне */}
                      {renderRows(direct)}

                      {/* Подкатегории */}
                      {subs.map(sub => {
                        const subProds = productMap.get(sub.id) ?? [];
                        if (subProds.length === 0) return null;
                        return (
                          <>
                            <TableRow key={`sub-${sub.id}`} className="bg-muted/20 hover:bg-muted/20">
                              <TableCell colSpan={COLS} className="py-1.5 pl-8">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <ChevronRight size={14} />
                                  {sub.name}
                                  <span className="text-xs">· {subProds.length}</span>
                                </span>
                              </TableCell>
                            </TableRow>
                            {renderRows(subProds)}
                          </>
                        );
                      })}
                    </>
                  );
                })}

                {/* Без категории */}
                {(productMap.get(null)?.length ?? 0) > 0 && (
                  <>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={COLS} className="py-2">
                        <span className="font-semibold text-sm text-muted-foreground">Без категории</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {productMap.get(null)!.length} товаров
                        </span>
                      </TableCell>
                    </TableRow>
                    {renderRows(productMap.get(null)!)}
                  </>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Показано: {totalVisible} из {products.length}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Удалить товар?"
        description={`«${deleteTarget?.name}» будет удалён без возможности восстановления.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

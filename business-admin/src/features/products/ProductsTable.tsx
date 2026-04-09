import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
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

interface ProductsTableProps {
  products: ProductWithCategory[];
  categories: Category[];
  onEdit: (product: ProductWithCategory) => void;
  onDeleted: (id: string) => void;
}

export function ProductsTable({ products, categories, onEdit, onDeleted }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);

  // Фильтрация по категории
  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter(p => p.category_id === categoryFilter);
  }, [products, categoryFilter]);

  async function handleToggleActive(product: ProductWithCategory) {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
      toast.success(`Товар ${!product.is_active ? 'активирован' : 'скрыт'}`);
      // Мутируем локально — страница перечитает данные через prop update
      product.is_active = !product.is_active;
    } catch {
      toast.error('Ошибка обновления');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      onDeleted(deleteTarget.id);
      toast.success('Товар удалён');
    } catch {
      toast.error('Ошибка удаления');
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = useMemo<ColumnDef<ProductWithCategory>[]>(() => [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => {
        const url = row.original.image_url;
        return url ? (
          <img src={url} alt="" className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted" />
        );
      },
      size: 56,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Название <ArrowUpDown size={14} />
        </button>
      ),
    },
    {
      id: 'category',
      header: 'Категория',
      accessorFn: row => (row.category as { name: string } | null)?.name ?? '—',
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Цена <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ getValue }) => `${getValue<number>().toLocaleString('ru')} ₽`,
    },
    {
      accessorKey: 'unit',
      header: 'Единица',
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting()}
        >
          Остаток <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ getValue }) => {
        const v = getValue<number>();
        return (
          <Badge variant={v > 0 ? 'secondary' : 'destructive'}>
            {v}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Активен',
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ], [onEdit]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все категории" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Таблица */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Товары не найдены
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Показано: {table.getRowModel().rows.length} из {products.length}
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

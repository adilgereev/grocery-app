import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { ProductWithCategory , Category } from "@/types";
import { ProductTableRow } from "./ProductTableRow";
import { ProductsTableFilters } from "./ProductsTableFilters";
import { ProductsTableHeader } from "./ProductsTableHeader";
import { ProductsCategoryRows } from "./ProductsCategoryRows";
import { useProductsTableLogic } from "./useProductsTableLogic";


interface ProductsTableProps {
  products: ProductWithCategory[];
  categories: Category[];
  onEdit: (product: ProductWithCategory) => void;
  onDeleted: (id: string) => void;
}

const COLS = 7;

export function ProductsTable({
  products,
  categories,
  onEdit,
  onDeleted,
}: ProductsTableProps) {
  const {
    sortKey,
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
  } = useProductsTableLogic(products, categories, onDeleted);

  function renderRows(prods: ProductWithCategory[]) {
    return prods.map((p) => (
      <ProductTableRow
        key={p.id}
        product={p}
        onEdit={onEdit}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />
    ));
  }

  return (
    <div className="space-y-3">
      <ProductsTableFilters
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        rootCategories={rootCategories}
        subcatMap={subcatMap}
      />

      {/* Иерархическая таблица */}
      <div className="rounded-lg border bg-card">
        <Table>
          <ProductsTableHeader
            sortKey={sortKey}
            onSort={toggleSort}
          />
          <TableBody>
            {totalVisible === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLS}
                  className="h-24 text-center text-muted-foreground"
                >
                  Товары не найдены
                </TableCell>
              </TableRow>
            ) : (
              <ProductsCategoryRows
                rootCategories={rootCategories}
                subcatMap={subcatMap}
                productMap={productMap}
                collapsedRoots={collapsedRoots}
                collapsedSubs={collapsedSubs}
                onToggleRoot={toggleRoot}
                onToggleSub={toggleSub}
                countInBranch={countInBranch}
                renderRows={renderRows}
              />
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Показано: {totalVisible} из {products.length}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Удалить товар?"
        description={`«${deleteTarget?.name}» будет удалён без возможности восстановления.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

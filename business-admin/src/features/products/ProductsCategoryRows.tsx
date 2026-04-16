import { TableCell, TableRow } from "@/components/ui/table";
import type { Category, ProductWithCategory } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";

const COLS = 7;

interface ProductsCategoryRowsProps {
  rootCategories: Category[];
  subcatMap: Map<string, Category[]>;
  productMap: Map<string | null, ProductWithCategory[]>;
  collapsedRoots: Set<string>;
  collapsedSubs: Set<string>;
  onToggleRoot: (id: string) => void;
  onToggleSub: (id: string) => void;
  countInBranch: (id: string) => number;
  renderRows: (products: ProductWithCategory[]) => React.ReactNode[];
}

export function ProductsCategoryRows({
  rootCategories,
  subcatMap,
  productMap,
  collapsedRoots,
  collapsedSubs,
  onToggleRoot,
  onToggleSub,
  countInBranch,
  renderRows,
}: ProductsCategoryRowsProps) {
  return (
    <>
      {rootCategories.map((root) => {
        if (countInBranch(root.id) === 0) return null;
        const subs = subcatMap.get(root.id) ?? [];
        const direct = productMap.get(root.id) ?? [];

        return (
          <div key={`root-${root.id}`}>
            {/* Заголовок корневой категории */}
            <TableRow
              className="bg-muted/40 hover:bg-muted/50 cursor-pointer select-none"
              onClick={() => onToggleRoot(root.id)}
            >
              <TableCell colSpan={COLS} className="py-2">
                <span className="flex items-center gap-2">
                  {collapsedRoots.has(root.id) ? (
                    <ChevronRight
                      size={14}
                      className="text-muted-foreground"
                    />
                  ) : (
                    <ChevronDown
                      size={14}
                      className="text-muted-foreground"
                    />
                  )}
                  <span className="font-semibold text-base">
                    {root.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {countInBranch(root.id)} товаров
                  </span>
                </span>
              </TableCell>
            </TableRow>

            {/* Товары и подкатегории — скрываем при collapse */}
            {!collapsedRoots.has(root.id) && (
              <>
                {/* Товары напрямую в корне */}
                {renderRows(direct)}

                {/* Подкатегории */}
                {subs.map((sub) => {
                  const subProds = productMap.get(sub.id) ?? [];
                  if (subProds.length === 0) return null;
                  return (
                    <div key={`sub-${sub.id}`}>
                      <TableRow
                        className="bg-muted/20 hover:bg-muted/30 cursor-pointer select-none"
                        onClick={() => onToggleSub(sub.id)}
                      >
                        <TableCell
                          colSpan={COLS}
                          className="py-1.5 pl-8"
                        >
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {collapsedSubs.has(sub.id) ? (
                              <ChevronRight size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                            <span className="text-sm font-medium">
                              {sub.name}
                            </span>
                            <span className="text-xs">
                              · {subProds.length}
                            </span>
                          </span>
                        </TableCell>
                      </TableRow>
                      {!collapsedSubs.has(sub.id) &&
                        renderRows(subProds)}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}

      {/* Без категории */}
      {(productMap.get(null)?.length ?? 0) > 0 && (
        <>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableCell colSpan={COLS} className="py-2">
              <span className="font-semibold text-sm text-muted-foreground">
                Без категории
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {productMap.get(null)!.length} товаров
              </span>
            </TableCell>
          </TableRow>
          {renderRows(productMap.get(null)!)}
        </>
      )}
    </>
  );
}

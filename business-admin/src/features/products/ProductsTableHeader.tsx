import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

const COLS = 7;

interface ProductsTableHeaderProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

export function ProductsTableHeader({
  sortKey,
  sortDir,
  onSort,
}: ProductsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-14" />
        <TableHead>
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground"
            onClick={() => onSort("name")}
          >
            Название
            <ArrowUpDown
              size={14}
              className={
                sortKey === "name"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            />
          </button>
        </TableHead>
        <TableHead>
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground"
            onClick={() => onSort("price")}
          >
            Цена
            <ArrowUpDown
              size={14}
              className={
                sortKey === "price"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            />
          </button>
        </TableHead>
        <TableHead>Единица</TableHead>
        <TableHead>
          <button
            className="flex items-center gap-1 font-medium hover:text-foreground"
            onClick={() => onSort("stock")}
          >
            Остаток
            <ArrowUpDown
              size={14}
              className={
                sortKey === "stock"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            />
          </button>
        </TableHead>
        <TableHead className="w-20">Активен</TableHead>
        <TableHead className="w-24" />
      </TableRow>
    </TableHeader>
  );
}

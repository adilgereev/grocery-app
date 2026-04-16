import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";
import { ChevronRight } from "lucide-react";

interface ProductsTableFiltersProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  rootCategories: Category[];
  subcatMap: Map<string, Category[]>;
}

export function ProductsTableFilters({
  globalFilter,
  onGlobalFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  rootCategories,
  subcatMap,
}: ProductsTableFiltersProps) {
  return (
    <div className="flex gap-3">
      <Input
        placeholder="Поиск по названию..."
        value={globalFilter}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        className="max-w-xs"
      />
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          <SelectItem value="__none__" className="text-muted-foreground">
            Без категории
          </SelectItem>
          {rootCategories.map((root) => (
            <div key={root.id}>
              <SelectItem
                value={root.id}
                className="font-semibold"
              >
                {root.name}
              </SelectItem>
              {(subcatMap.get(root.id) ?? []).map((sub) => (
                <SelectItem
                  key={sub.id}
                  value={sub.id}
                  className="pl-7 text-muted-foreground"
                >
                  <span className="flex items-center gap-1">
                    <ChevronRight size={12} className="shrink-0" />
                    {sub.name}
                  </span>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

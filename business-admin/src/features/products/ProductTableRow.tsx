import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ProductWithCategory } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback } from "react";

interface ProductTableRowProps {
  product: ProductWithCategory;
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
  onToggleActive: (product: ProductWithCategory) => void;
}

export function ProductTableRow({
  product: p,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductTableRowProps) {
  const handleToggleActive = useCallback(
    () => onToggleActive(p),
    [p, onToggleActive],
  );

  const handleEdit = useCallback(() => onEdit(p), [p, onEdit]);
  const handleDelete = useCallback(() => onDelete(p), [p, onDelete]);

  return (
    <TableRow className={!p.is_active ? "opacity-50" : undefined}>
      <TableCell>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt=""
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted" />
        )}
      </TableCell>
      <TableCell className="font-medium">{p.name}</TableCell>
      <TableCell>{p.price.toLocaleString("ru")} ₽</TableCell>
      <TableCell className="text-muted-foreground">{p.unit}</TableCell>
      <TableCell>
        <Badge variant={p.stock > 0 ? "secondary" : "destructive"}>
          {p.stock}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={p.is_active}
          onCheckedChange={handleToggleActive}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

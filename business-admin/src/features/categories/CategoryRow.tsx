import { Pencil, Trash2, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Category } from '@/types';

interface CategoryRowProps {
  category: Category;
  index: number;
  siblingsCount: number;
  isSubcategory: boolean;
  isToggling: boolean;
  onToggleActive: (category: Category) => Promise<void>;
  onMove: (category: Category, direction: 'up' | 'down') => Promise<void>;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/**
 * Отдельный компонент строки категории для декомпозиции CategoriesTable.
 */
export function CategoryRow({
  category,
  index,
  siblingsCount,
  isSubcategory,
  isToggling,
  onToggleActive,
  onMove,
  onEdit,
  onDelete,
}: CategoryRowProps) {
  return (
    <TableRow className={!category.is_active ? 'opacity-50' : undefined}>
      {/* Изображение */}
      <TableCell>
        {category.image_url ? (
          <img src={category.image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-md bg-muted" />
        )}
      </TableCell>

      {/* Название с отступом для подкатегорий */}
      <TableCell className="font-medium">
        {isSubcategory ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <ChevronRight size={14} className="shrink-0 text-muted-foreground/50" />
            {category.name}
          </span>
        ) : (
          <span className="font-semibold">{category.name}</span>
        )}
      </TableCell>

      {/* Slug */}
      <TableCell className="font-mono text-sm text-muted-foreground">{category.slug}</TableCell>

      {/* Активность — инлайн тогл */}
      <TableCell>
        <Switch
          checked={category.is_active}
          onCheckedChange={() => onToggleActive(category)}
          disabled={isToggling}
          data-testid={`category-active-${category.id}`}
        />
      </TableCell>

      {/* Кнопки сортировки — только среди одного уровня */}
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMove(category, 'up')}
            data-testid={`category-move-up-${category.id}`}
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={index === siblingsCount - 1}
            onClick={() => onMove(category, 'down')}
            data-testid={`category-move-down-${category.id}`}
          >
            <ArrowDown size={14} />
          </Button>
        </div>
      </TableCell>

      {/* Действия */}
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
            data-testid={`category-edit-${category.id}`}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
            data-testid={`category-delete-${category.id}`}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

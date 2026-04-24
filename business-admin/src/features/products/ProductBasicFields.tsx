import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormValues } from './productSchema';
import type { Category } from '@/types';

interface ProductBasicFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  rootCategories: Category[];
  subCategories: Category[];
}

export function ProductBasicFields({
  form,
  rootCategories,
  subCategories,
}: ProductBasicFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Название */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>Название *</FormLabel>
            <FormControl>
              <Input placeholder="Молоко 3.2%" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Цена */}
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Цена (₽) *</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Единица */}
      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Единица *</FormLabel>
            <FormControl>
              <Input placeholder="шт, кг, л, г" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Остаток */}
      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Остаток</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Категория */}
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Категория *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rootCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Корневые</div>
                    {rootCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </>
                )}
                {subCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Подкатегории</div>
                    {subCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>— {c.name}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

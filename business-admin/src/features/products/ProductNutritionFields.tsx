import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from './productSchema';

interface ProductNutritionFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

export function ProductNutritionFields({
  form,
}: ProductNutritionFieldsProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">КБЖУ (на 100г)</p>
      <div className="grid grid-cols-4 gap-2">
        {(['calories', 'proteins', 'fats', 'carbohydrates'] as const).map((field) => {
          const labels = { calories: 'Калории', proteins: 'Белки', fats: 'Жиры', carbohydrates: 'Углеводы' };
          return (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="text-xs">{labels[field]}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="—"
                      value={f.value ?? ''}
                      onChange={e => f.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

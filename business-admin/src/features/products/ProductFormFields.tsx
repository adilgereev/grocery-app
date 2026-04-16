import type { UseFormReturn } from 'react-hook-form';
import {
  FormControl, FormField, FormItem, FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { DialogFooter } from '@/components/ui/dialog';
import { ProductNutritionFields } from './ProductNutritionFields';
import { ProductBasicFields } from './ProductBasicFields';
import type { ProductFormValues } from './productSchema';
import type { Category } from '@/types';

interface ProductFormFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  isEdit: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function ProductFormFields({
  form,
  categories,
  isEdit,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProductFormFieldsProps) {
  const rootCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id !== null);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Изображение */}
      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Изображение</FormLabel>
            <FormControl>
              <ImageUploader
                value={field.value}
                folder="products"
                onUpload={field.onChange}
                onClear={() => field.onChange(null)}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <ProductBasicFields
        form={form}
        rootCategories={rootCategories}
        subCategories={subCategories}
      />

      {/* Описание */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Описание</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Краткое описание..." {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Теги */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Теги (через запятую)</FormLabel>
            <FormControl>
              <Input placeholder="хит, новинка, акция" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* КБЖУ */}
      <ProductNutritionFields form={form} />

      {/* Активность */}
      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0">Товар активен (виден покупателям)</FormLabel>
          </FormItem>
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogFooter>
    </form>
  );
}

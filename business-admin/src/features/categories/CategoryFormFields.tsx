import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/shared/ImageUploader';
import type { UseFormReturn } from 'react-hook-form';
import type { CategoryFormValues } from './categorySchema';
import type { Category } from '@/types';
import { slugify } from '@/lib/slugify';

interface CategoryFormFieldsProps {
  form: UseFormReturn<CategoryFormValues>;
  parentOptions: Category[];
  isEdit: boolean;
}

/**
 * Поля формы категории для декомпозиции CategoryFormModal.
 */
export function CategoryFormFields({ form, parentOptions, isEdit }: CategoryFormFieldsProps) {
  function handleNameBlur(name: string) {
    const currentSlug = form.getValues('slug');
    if (!currentSlug || (!isEdit && currentSlug === slugify(form.getValues('name').slice(0, -1)))) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }

  return (
    <>
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
                folder="categories"
                onUpload={field.onChange}
                onClear={() => field.onChange(null)}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Название */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Название *</FormLabel>
            <FormControl>
              <Input
                placeholder="Молочные продукты"
                {...field}
                onBlur={e => {
                  field.onBlur();
                  handleNameBlur(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl>
              <Input placeholder="molochnie-produkty" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Родительская категория */}
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Родительская категория</FormLabel>
              <Select
                onValueChange={v => field.onChange(v === 'none' ? null : v)}
                value={field.value ?? 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Корневая" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">— Корневая —</SelectItem>
                  {parentOptions.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Порядок сортировки */}
        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Порядок</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Активность */}
      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0">Категория активна (видна покупателям)</FormLabel>
          </FormItem>
        )}
      />
    </>
  );
}

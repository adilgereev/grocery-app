import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { categorySchema, type CategoryFormValues } from './categorySchema';
import { slugify } from '@/lib/slugify';
import type { Category } from '@/types';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categories: Category[];
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  categories,
  onSubmit,
}: CategoryFormModalProps) {
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      parent_id: null,
      image_url: null,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id,
        image_url: category.image_url,
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      form.reset({ name: '', slug: '', parent_id: null, image_url: null, sort_order: 0, is_active: true });
    }
  }, [category, form, open]);

  // Автогенерация slug при изменении имени
  function handleNameBlur(name: string) {
    const currentSlug = form.getValues('slug');
    if (!currentSlug || (!isEdit && currentSlug === slugify(form.getValues('name').slice(0, -1)))) {
      form.setValue('slug', slugify(name), { shouldValidate: true });
    }
  }

  async function handleSubmit(values: CategoryFormValues) {
    await onSubmit({ ...values, parent_id: values.parent_id || null });
    form.reset();
    onOpenChange(false);
  }

  // Для parent_id: исключаем саму категорию и её потомков
  const parentOptions = categories.filter(c => c.parent_id === null && c.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

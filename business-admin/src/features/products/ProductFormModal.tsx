import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { productSchema, type ProductFormValues } from './productSchema';
import type { ProductWithCategory, Category } from '@/types';

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductWithCategory | null;
  categories: Category[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  categories,
  onSubmit,
}: ProductFormModalProps) {
  const isEdit = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      unit: 'шт',
      stock: 0,
      category_id: '',
      is_active: true,
      image_url: null,
      tags: '',
      calories: null,
      proteins: null,
      fats: null,
      carbohydrates: null,
    },
  });

  // Заполняем форму при редактировании
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        category_id: product.category_id ?? '',
        is_active: product.is_active,
        image_url: product.image_url,
        tags: product.tags?.join(', ') ?? '',
        calories: product.calories,
        proteins: product.proteins,
        fats: product.fats,
        carbohydrates: product.carbohydrates,
      });
    } else {
      form.reset();
    }
  }, [product, form, open]);

  async function handleSubmit(values: ProductFormValues) {
    await onSubmit(values);
    form.reset();
    onOpenChange(false);
  }

  // Только корневые категории в выборе
  const rootCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
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
                      folder="products"
                      onUpload={field.onChange}
                      onClear={() => field.onChange(null)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { productSchema, type ProductFormValues } from './productSchema';
import { ProductFormFields } from './ProductFormFields';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать товар' : 'Новый товар'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <ProductFormFields
            form={form}
            categories={categories}
            isEdit={isEdit}
            isSubmitting={form.formState.isSubmitting}
            onSubmit={form.handleSubmit(handleSubmit)}
            onCancel={() => onOpenChange(false)}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { categorySchema, type CategoryFormValues } from './categorySchema';
import type { Category } from '@/types';
import { CategoryFormFields } from './CategoryFormFields';

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categories: Category[];
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

/**
 * Модальное окно создания/редактирования категории.
 * Декомпозировано: поля формы вынесены в CategoryFormFields.
 */
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
      is_active: true,
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

  async function handleSubmit(values: CategoryFormValues) {
    await onSubmit({ ...values, parent_id: values.parent_id || null });
    form.reset();
    onOpenChange(false);
  }

  const parentOptions = categories.filter(c => c.parent_id === null && c.id !== category?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CategoryFormFields 
              form={form} 
              parentOptions={parentOptions} 
              isEdit={isEdit} 
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

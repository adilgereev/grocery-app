import { createProduct, fetchProductForEdit, updateProduct } from '@/lib/api/adminApi';
import { usePopularProductsStore } from '@/store/popularProductsStore';
import { showAlert } from '@/lib/utils/platformUtils';
import { productSchema, ProductFormData } from '@/lib/utils/schemas';
import { useCategoryList } from '@/hooks/domain/useCategoryList';
import { useImagePicker } from '@/hooks/ui/useImagePicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Control, FieldErrors, UseFormSetValue, useForm } from 'react-hook-form';

interface UseProductFormProps {
  mode: 'add' | 'edit';
  productId?: string;
}

interface UseProductFormReturn {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  handleSubmit: ReturnType<typeof useForm<ProductFormData>>['handleSubmit'];
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading: boolean;
  initialLoading: boolean;
  pickerVisible: boolean;
  setPickerVisible: (visible: boolean) => void;
  categoryId: string;
  selectedCategoryName: string | undefined;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  uploading: boolean;
  pickImage: () => void;
  categories: ReturnType<typeof useCategoryList>['categories'];
  setValue: UseFormSetValue<ProductFormData>;
}

export function useProductForm({ mode, productId }: UseProductFormProps): UseProductFormReturn {
  const router = useRouter();
  const { categories } = useCategoryList();
  const invalidatePopular = usePopularProductsStore(state => state.invalidateCache);
  const { imageUrl, setImageUrl, uploading, pickImage } = useImagePicker('products');

  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      price: '',
      unit: '1 шт',
      stock: '100',
      isActive: true,
      tags: '',
      calories: '',
      proteins: '',
      fats: '',
      carbohydrates: '',
      categoryId: '',
    },
  });

  const categoryId = watch('categoryId');
  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;

  // Загрузка данных товара в режиме редактирования
  const loadProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await fetchProductForEdit(productId);
      if (data) {
        reset({
          name: data.name || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          unit: data.unit || '',
          stock: data.stock != null ? data.stock.toString() : '100',
          isActive: data.is_active ?? true,
          tags: (data.tags || []).join(', '),
          calories: data.calories != null ? data.calories.toString() : '',
          proteins: data.proteins != null ? data.proteins.toString() : '',
          fats: data.fats != null ? data.fats.toString() : '',
          carbohydrates: data.carbohydrates != null ? data.carbohydrates.toString() : '',
          categoryId: data.category_id || '',
        });
        setImageUrl(data.image_url || '');
      }
    } catch {
      showAlert('Ошибка', 'Не удалось загрузить товар');
    } finally {
      setInitialLoading(false);
    }
  }, [productId, reset, setImageUrl]);

  useEffect(() => {
    if (mode === 'edit') {
      loadProduct();
    }
  }, [mode, loadProduct]);

  const onSubmit = useCallback(async (data: ProductFormData) => {
    const parsedTags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedCalories = data.calories.trim() ? parseFloat(data.calories) : null;
    const parsedProteins = data.proteins.trim() ? parseFloat(data.proteins) : null;
    const parsedFats = data.fats.trim() ? parseFloat(data.fats) : null;
    const parsedCarbohydrates = data.carbohydrates.trim() ? parseFloat(data.carbohydrates) : null;

    const payload = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      unit: data.unit,
      image_url: imageUrl,
      category_id: data.categoryId,
      is_active: data.isActive,
      stock: data.stock.trim() ? parseInt(data.stock) : 100,
      tags: parsedTags,
      calories: parsedCalories,
      proteins: parsedProteins,
      fats: parsedFats,
      carbohydrates: parsedCarbohydrates,
    };

    setLoading(true);
    try {
      if (mode === 'add') {
        await createProduct(payload);
        invalidatePopular();
        showAlert('Успех', 'Товар успешно добавлен в каталог!', [
          { text: 'ОК', onPress: () => router.back() },
        ]);
      } else {
        await updateProduct(productId!, payload);
        invalidatePopular();
        showAlert('Успех', 'Товар успешно обновлён!', [
          { text: 'ОК', onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      showAlert('Ошибка при сохранении', msg);
    } finally {
      setLoading(false);
    }
  }, [imageUrl, mode, productId, router, invalidatePopular]);

  return {
    control,
    errors,
    handleSubmit,
    onSubmit,
    loading,
    initialLoading,
    pickerVisible,
    setPickerVisible,
    categoryId,
    selectedCategoryName,
    imageUrl,
    setImageUrl,
    uploading,
    pickImage,
    categories,
    setValue,
  };
}

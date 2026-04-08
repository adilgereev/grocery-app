import ProductFormScreen from '@/components/admin/ProductFormScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function EditProductScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <ProductFormScreen mode="edit" productId={id} />;
}

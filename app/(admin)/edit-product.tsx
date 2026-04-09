import ProductFormScreen from '@/components/admin/ProductFormScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProductScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Редактирование" />
      <ProductFormScreen mode="edit" productId={id} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

import ProductFormScreen from '@/components/admin/ProductFormScreen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddProductScreen() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScreenHeader title="Новый Товар" />
      <ProductFormScreen mode="add" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

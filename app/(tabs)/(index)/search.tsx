import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ProductCard from '@/components/product/ProductCard';
import SearchHeader from '@/components/search/SearchHeader';
import SearchEmptyState from '@/components/search/SearchEmptyState';
import SearchNoResults from '@/components/search/SearchNoResults';
import { useSearch } from '@/hooks/useSearch';
import { Colors, Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    recommended,
    loading,
    error,
    hasSearched,
    getItemLayout,
    handleProductPress,
    handleSearchSubmit,
    handleTagPress,
    handleClear,
    performSearch,
  } = useSearch();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SearchHeader
          query={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          onClear={handleClear}
          onBack={() => router.back()}
        />

        {query.trim().length === 0 || (!loading && !hasSearched) ? (
          <SearchEmptyState
            recommended={recommended}
            onTagPress={handleTagPress}
            onProductPress={handleProductPress}
          />
        ) : hasSearched && results.length === 0 ? (
          <SearchNoResults
            error={error}
            loading={loading}
            onRetry={() => query && performSearch(query)}
          />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            getItemLayout={getItemLayout}
            renderItem={({ item, index }) => (
              <ProductCard
                item={item}
                index={index}
                onPress={() => handleProductPress(item.id, item.name)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: Spacing.m,
    paddingBottom: Spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

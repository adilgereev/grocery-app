import { Colors, Radius, Spacing } from '@/constants/theme';
import { DaDataSuggestion, getAddressSuggestions } from '@/lib/dadataApi';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface AddressSearchInputProps {
  onSelect: (suggestion: DaDataSuggestion) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
  city?: string;
}

export default function AddressSearchInput({ 
  onSelect, 
  onChangeText,
  placeholder, 
  initialValue = '', 
  city 
}: AddressSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Синхронизируем внутренний запрос с внешним значением (например, после выбора на карте)
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue, query]);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (inputValue: string) => {
        if (inputValue.length < 2) {
          setSuggestions([]);
          return;
        }
        setIsLoading(true);
        const res = await getAddressSuggestions(inputValue, city);
        setSuggestions(res);
        setIsLoading(false);
      }, 500),
    [city]
  );

  const fetchSuggestions = (val: string) => {
    debouncedFetch(val);
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    setShowSuggestions(text.length >= 2);
    fetchSuggestions(text);
    if (onChangeText) onChangeText(text);
  };

  const handleSelect = (item: DaDataSuggestion) => {
    if (!item.data.house) {
      // Это выбор просто улицы - добавляем пробел и продолжаем поиск домов
      const nextQuery = item.value + ' ';
      setQuery(nextQuery);
      setShowSuggestions(true);
      fetchSuggestions(nextQuery);
      
      // Передаем обновленное содержимое во внешнюю форму через onChangeText
      if (onChangeText) onChangeText(nextQuery);
    } else {
      // Это уже конкретный дом - завершаем выбор
      setQuery(item.value);
      setSuggestions([]);
      setShowSuggestions(false);
      onSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor={Colors.light.textLight}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setShowSuggestions(query.length >= 2)}
          multiline={true}
          blurOnSubmit={true}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        
        {query.length === 0 && (
          <View style={styles.placeholderContainer} pointerEvents="none">
            <Ionicons name="location-outline" size={20} color={Colors.light.textLight} style={styles.icon} />
            <Text style={styles.placeholderText}>{placeholder || "Начните вводить адрес..."}</Text>
          </View>
        )}

        {isLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={() => { 
            setQuery(''); 
            setSuggestions([]); 
            if (onChangeText) onChangeText('');
          }}>
            <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {query.length > 0 && query.length < 2 && !isLoading && (
        <Text style={styles.hintText}>Минимум 2 символа для поиска</Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.unrestricted_value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
                <Ionicons name="map-outline" size={18} color={Colors.light.textLight} style={styles.suggestionIcon} />
                <View style={styles.flex1}>
                  <Text style={styles.suggestionText} numberOfLines={1}>{item.value}</Text>
                  {item.data.city && <Text style={styles.suggestionSubtext}>{item.data.city}</Text>}
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="always"
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 100 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.card, minHeight: 54, borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  icon: { marginRight: Spacing.s },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingTop: Platform.OS === 'ios' ? 4 : 0,
    paddingBottom: Platform.OS === 'ios' ? 4 : 0,
  },
  hintText: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginTop: 4,
    marginLeft: Spacing.m,
  },
  loader: { marginRight: Spacing.s },
  placeholderContainer: {
    position: 'absolute',
    left: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.textLight,
  },
  suggestionsContainer: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    marginTop: 4,
    backgroundColor: Colors.light.card, borderRadius: Radius.m,
    elevation: 10, shadowColor: Colors.light.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
    maxHeight: 300, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.m,
  },
  suggestionIcon: { marginRight: 10 },
  suggestionText: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  suggestionSubtext: { fontSize: 12, color: Colors.light.textLight, marginTop: 2 },
  flex1: { flex: 1 },
});

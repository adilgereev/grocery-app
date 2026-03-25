import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { getAddressSuggestions, DaDataSuggestion } from '@/lib/dadataApi';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface AddressSearchInputProps {
  onSelect: (suggestion: DaDataSuggestion) => void;
  placeholder?: string;
  initialValue?: string;
  city?: string;
}

export default function AddressSearchInput({ onSelect, placeholder, initialValue = '', city }: AddressSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Синхронизируем внутренний запрос с внешним значением (например, после выбора на карте)
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const fetchSuggestions = useCallback(
    debounce(async (val: string) => {
      if (val.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      const res = await getAddressSuggestions(val, city);
      setSuggestions(res);
      setIsLoading(false);
    }, 500),
    [city]
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    setShowSuggestions(true);
    fetchSuggestions(text);
  };

  const handleSelect = (item: DaDataSuggestion) => {
    setQuery(item.value);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color={Colors.light.textLight} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Начните вводить адрес..."}
          placeholderTextColor={Colors.light.textLight}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setShowSuggestions(query.length >= 3)}
        />
        {isLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }}>
            <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.unrestricted_value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
                <Ionicons name="map-outline" size={18} color={Colors.light.textLight} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
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
    backgroundColor: '#fff', height: 54, borderRadius: Radius.m,
    paddingHorizontal: Spacing.m,
  },
  icon: { marginRight: Spacing.s },
  input: { flex: 1, fontSize: 16, color: Colors.light.text },
  loader: { marginRight: Spacing.s },
  suggestionsContainer: {
    position: 'absolute', top: 60, left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: Radius.m,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10,
    maxHeight: 300, overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.m,
  },
  suggestionText: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  suggestionSubtext: { fontSize: 12, color: Colors.light.textLight, marginTop: 2 },
});

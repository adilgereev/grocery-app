import { Colors, Radius, Spacing, Shadows } from '@/constants/theme';
import { DaDataSuggestion, getAddressSuggestions } from '@/lib/dadataApi';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface AddressSearchInputProps {
  onSelect: (suggestion: DaDataSuggestion) => void;
  onChangeText?: (text: string) => void;
  onToggleSuggestions?: (visible: boolean) => void;
  placeholder?: string;
  initialValue?: string;
  city?: string;
}

export default function AddressSearchInput({
  onSelect,
  onChangeText,
  onToggleSuggestions,
  placeholder,
  initialValue = '',
  city
}: AddressSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<DaDataSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const prevInitialValue = React.useRef(initialValue);

  // Синхронизируемся с внешним значением только если оно реально изменилось (например, выбор на карте)
  useEffect(() => {
    if (initialValue !== prevInitialValue.current) {
      setQuery(initialValue || '');
      prevInitialValue.current = initialValue;
    }
  }, [initialValue]);

  // Уведомляем родителя об изменении видимости подсказок
  useEffect(() => {
    const isVisible = showSuggestions && suggestions.length > 0;
    if (onToggleSuggestions) {
      onToggleSuggestions(isVisible);
    }
  }, [showSuggestions, suggestions, onToggleSuggestions]);

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
      Keyboard.dismiss(); // Скрываем клавиатуру при финальном выборе
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
          keyboardAppearance="light"
          testID="address-search-input"
        />

        {query.length === 0 && (
          <View style={styles.placeholderContainer} pointerEvents="none">
            <Ionicons name="location-outline" size={20} color={Colors.light.textLight} style={styles.icon} />
            <Text style={styles.placeholderText}>{placeholder || "Начните вводить адрес..."}</Text>
          </View>
        )}

        {isLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={styles.loader} testID="address-search-loader" />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity 
            onPress={() => {
              setQuery('');
              setSuggestions([]);
              if (onChangeText) onChangeText('');
            }}
            testID="address-search-clear"
          >
            <Ionicons name="close-circle" size={20} color={Colors.light.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {query.length > 0 && query.length < 2 && !isLoading && (
        <Text style={styles.hintText}>Минимум 2 символа для поиска</Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsScroll}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            testID="address-suggestions-scroll"
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.unrestricted_value}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
                testID={`suggestion-item-${item.unrestricted_value}`}
              >
                <Ionicons name="map-outline" size={18} color={Colors.light.textLight} style={styles.suggestionIcon} />
                <View style={styles.flex1}>
                  <Text style={styles.suggestionText} numberOfLines={1}>{item.value}</Text>
                  {item.data.city && <Text style={styles.suggestionSubtext}>{item.data.city}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    ...Shadows.md,
    maxHeight: 400, overflow: 'hidden',
  },
  suggestionsScroll: {
    maxHeight: 400,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.m,
  },
  suggestionIcon: { marginRight: 10 },
  suggestionText: { fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  suggestionSubtext: { fontSize: 12, color: Colors.light.textLight, marginTop: 2 },
  flex1: { flex: 1 },
});

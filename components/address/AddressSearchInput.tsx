import { Colors } from '@/constants/theme';
import { DaDataSuggestion, getAddressSuggestions } from '@/lib/api/dadataApi';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addressSearchStyles as s } from './AddressSearchInput.styles';

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
    <View style={s.container}>
      <View style={s.inputWrapper}>
        <TextInput
          style={s.input}
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
          <View style={s.placeholderContainer} pointerEvents="none">
            <Ionicons name="location-outline" size={20} color={Colors.light.textLight} style={s.icon} />
            <Text style={s.placeholderText}>{placeholder || "Начните вводить адрес..."}</Text>
          </View>
        )}

        {isLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={s.loader} testID="address-search-loader" />}
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
        <Text style={s.hintText}>Минимум 2 символа для поиска</Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={s.suggestionsContainer}>
          <ScrollView
            style={s.suggestionsScroll}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            testID="address-suggestions-scroll"
          >
            {suggestions.map((item, index) => {
              const isCompleteAddress = !!item.data.house;
              return (
                <View key={item.unrestricted_value}>
                  {index > 0 && <View style={s.suggestionDivider} />}
                  <TouchableOpacity
                    style={s.suggestionItem}
                    onPress={() => handleSelect(item)}
                    testID={`suggestion-item-${item.unrestricted_value}`}
                  >
                    <Ionicons
                      name={isCompleteAddress ? 'location-sharp' : 'chevron-forward-outline'}
                      size={18}
                      color={isCompleteAddress ? Colors.light.primary : Colors.light.textLight}
                      style={s.suggestionIcon}
                    />
                    <View style={s.flex1}>
                      <Text style={s.suggestionText} numberOfLines={2}>{item.value}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

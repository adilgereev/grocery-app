import { DaDataSuggestion } from '@/lib/api/dadataApi';
import { formatAddressString } from '@/lib/utils/addressUtils';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

interface UseAddressSearchProps {
  onAddressChange: (text: string) => void;
  onHouseChange: (house: string) => void;
  onCoordsChange: (lat: number, lon: number) => void;
}

export function useAddressSearch({
  onAddressChange,
  onHouseChange,
  onCoordsChange,
}: UseAddressSearchProps) {
  const handleTextChange = useCallback(
    (text: string) => {
      onAddressChange(text);
      onHouseChange(''); // Сбрасываем выбранный дом при ручном вводе
    },
    [onAddressChange, onHouseChange]
  );

  const handleSelect = useCallback(
    (suggestion: DaDataSuggestion) => {
      const formatted = formatAddressString(suggestion);
      onAddressChange(formatted);

      if (suggestion.data.geo_lat && suggestion.data.geo_lon) {
        onCoordsChange(parseFloat(suggestion.data.geo_lat), parseFloat(suggestion.data.geo_lon));
      }

      if (suggestion.data.house) {
        onHouseChange(suggestion.data.house);
      } else {
        onHouseChange('');
      }

      Haptics.selectionAsync();
    },
    [onAddressChange, onCoordsChange, onHouseChange]
  );

  return {
    handleTextChange,
    handleSelect,
  };
}

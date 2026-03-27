import axios from 'axios';
import { logger } from './logger';

const DADATA_API_KEY = process.env.EXPO_PUBLIC_DADATA_API_KEY || '';
const SUGGEST_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
const GEOLOCATE_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address';

export interface DaDataSuggestion {
  value: string;
  unrestricted_value: string;
  data: {
    city?: string;
    street_with_type?: string;
    house?: string;
    geo_lat: string;
    geo_lon: string;
    postal_code?: string;
    block?: string;
    flat?: string;
  };
}

export const getAddressSuggestions = async (query: string, city?: string): Promise<DaDataSuggestion[]> => {
  if (!DADATA_API_KEY) {
    logger.warn('DaData API Key is missing. Suggestions will not work.');
    return [];
  }

  try {
    const response = await axios.post(
      SUGGEST_URL,
      {
        query,
        locations: city ? [{ city }] : [],
        from_bound: { value: 'street' }, // Начинаем поиск с улиц
        to_bound: { value: 'house' },     // Заканчиваем домами
        restrict_value: true,            // Не показывать название города в самой подсказке, если он уже в фильтре
        count: 5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`,
        },
      }
    );

    logger.log('DaData API Response:', response.data.suggestions);
    return response.data.suggestions || [];
  } catch (error) {
    logger.error('DaData Suggesion Error:', error);
    return [];
  }
};

export const getAddressByCoords = async (lat: number, lon: number): Promise<DaDataSuggestion | null> => {
  if (!DADATA_API_KEY) return null;

  try {
    const response = await axios.post(
      GEOLOCATE_URL,
      { lat, lon, count: 1 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Token ${DADATA_API_KEY}`,
        },
      }
    );

    const suggestions = response.data.suggestions || [];
    return suggestions.length > 0 ? suggestions[0] : null;
  } catch (error) {
    logger.error('DaData Geolocate Error:', error);
    return null;
  }
};

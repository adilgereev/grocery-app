import { useAddressStore } from '@/store/addressStore';
import { useRouter } from 'expo-router';
import { Address } from '@/types';

export function useAddresses() {
  const addresses = useAddressStore(state => state.addresses);
  const selectedAddressId = useAddressStore(state => state.selectedAddressId);
  const selectAddress = useAddressStore(state => state.selectAddress);
  const router = useRouter();

  const formatDetails = (item: Address): string => {
    const parts: string[] = [];
    if (item.apartment) parts.push(`кв. ${item.apartment}`);
    if (item.entrance) parts.push(`под. ${item.entrance}`);
    if (item.floor) parts.push(`эт. ${item.floor}`);
    return parts.join(', ');
  };

  return { addresses, selectedAddressId, selectAddress, router, formatDetails };
}

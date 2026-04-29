import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from '@/store/networkStore';

export function useNetworkStatus() {
  const setConnected = useNetworkStore((s) => s.setConnected);

  useEffect(() => {
    NetInfo.fetch().then((state) => setConnected(state.isConnected ?? true));

    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, [setConnected]);
}

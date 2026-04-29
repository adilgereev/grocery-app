import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  setConnected: (value: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  setConnected: (value) => set({ isConnected: value }),
}));

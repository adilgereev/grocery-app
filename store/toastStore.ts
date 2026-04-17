import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastStore {
  visible: boolean;
  type: ToastType;
  message: string;
  // инкрементируется при каждом вызове → force remount ErrorToast для перезапуска анимации
  _key: number;
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  visible: false,
  type: 'info',
  message: '',
  _key: 0,
  showToast: (type, message) =>
    set((s) => ({ visible: true, type, message, _key: s._key + 1 })),
  hideToast: () => set({ visible: false }),
}));

import { useAddressStore } from '../addressStore';
import { supabase } from '@/lib/services/supabase';

// Типизируем мок Supabase
const mockSupabase = supabase as any;

describe('useAddressStore', () => {
  const mockAddress = {
    id: 'addr-1',
    text: 'ул. Ленина, 10',
    is_selected: false,
    user_id: 'test-user-id',
  };

  const mockAddress2 = {
    id: 'addr-2',
    text: 'ул. Пушкина, 5',
    is_selected: true,
    user_id: 'test-user-id',
  };

  beforeEach(() => {
    // Сброс стейта перед каждым тестом
    useAddressStore.setState({
      addresses: [],
      selectedAddressId: null,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('loadAddresses', () => {
    it('should load addresses and select the one with is_selected: true', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.order.mockReturnThis();
      
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: [mockAddress, mockAddress2], error: null }).then(onFulfilled)
      );

      await useAddressStore.getState().loadAddresses();

      const state = useAddressStore.getState();
      expect(state.addresses.length).toBe(2);
      expect(state.selectedAddressId).toBe('addr-2');
    });

    it('should fallback to selecting the first address if none have is_selected: true', async () => {
      mockSupabase.then.mockImplementationOnce((onFulfilled: any) => 
        Promise.resolve({ data: [mockAddress], error: null }).then(onFulfilled)
      );

      await useAddressStore.getState().loadAddresses();

      const state = useAddressStore.getState();
      expect(state.selectedAddressId).toBe('addr-1');
    });
  });

  describe('addAddress', () => {
    it('should add a new address and select it if it is the first one', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValue({ data: { ...mockAddress, is_selected: true }, error: null });

      await useAddressStore.getState().addAddress({ text: 'ул. Ленина, 10' });

      const state = useAddressStore.getState();
      expect(state.addresses.length).toBe(1);
      expect(state.selectedAddressId).toBe('addr-1');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ is_selected: true }));
    });

    it('should not select the new address if there are already existing addresses', async () => {
      // Предзаполняем стейт
      useAddressStore.setState({ addresses: [mockAddress2], selectedAddressId: 'addr-2' });

      mockSupabase.single.mockResolvedValue({ data: { ...mockAddress, is_selected: false }, error: null });

      await useAddressStore.getState().addAddress({ text: 'ул. Ленина, 10' });

      const state = useAddressStore.getState();
      expect(state.addresses.length).toBe(2);
      expect(state.selectedAddressId).toBe('addr-2'); // Остался старый
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ is_selected: false }));
    });
  });

  describe('selectAddress', () => {
    it('should update selection locally and on backend using RPC', async () => {
      useAddressStore.setState({ addresses: [mockAddress, mockAddress2], selectedAddressId: 'addr-2' });

      mockSupabase.rpc.mockResolvedValue({ error: null });

      await useAddressStore.getState().selectAddress('addr-1');

      const state = useAddressStore.getState();
      expect(state.selectedAddressId).toBe('addr-1');
      expect(state.addresses.find(a => a.id === 'addr-1')?.is_selected).toBe(true);
      expect(state.addresses.find(a => a.id === 'addr-2')?.is_selected).toBe(false);

      // Проверяем вызов RPC вместо update
      expect(mockSupabase.rpc).toHaveBeenCalledWith('select_delivery_address', {
        p_user_id: 'test-user-id',
        p_address_id: 'addr-1'
      });
    });
  });

  describe('removeAddress', () => {
    it('should remove address and fallback to another if the removed one was selected', async () => {
      useAddressStore.setState({ addresses: [mockAddress, mockAddress2], selectedAddressId: 'addr-1' });

      mockSupabase.from.mockReturnThis();
      mockSupabase.delete.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.then.mockImplementation((onFulfilled: any) => 
        Promise.resolve({ error: null }).then(onFulfilled)
      );

      await useAddressStore.getState().removeAddress('addr-1');

      const state = useAddressStore.getState();
      expect(state.addresses.length).toBe(1);
      expect(state.selectedAddressId).toBe('addr-2');
    });
  });
});

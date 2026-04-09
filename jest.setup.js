// Common mocks for Jest tests in React Native/Expo

// Mock AsyncStorage for Zustand persist and other uses
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: 'Link',
}));

// --- Supabase Mock Helper ---
const mockSupabaseResponse = (data = null, error = null) => ({
  data,
  error,
});

const createSupabaseMock = () => {
  const mockChain = {
    auth: {
      getSession: jest.fn().mockImplementation(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      })),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse())),
    maybeSingle: jest.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse())),
    then: jest.fn().mockImplementation((onFulfilled) => {
      // Default behavior for thenable chain
      return Promise.resolve(mockSupabaseResponse([])).then(onFulfilled);
    }),
  };

  return mockChain;
};

// Mock the whole @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createSupabaseMock()),
}));

// Mock our internal supabase client
jest.mock('@/lib/services/supabase', () => ({
  supabase: createSupabaseMock(),
}));

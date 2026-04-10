import { useAppStore } from '../appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ isReady: false });
  });

  it('начальное состояние: isReady === false', () => {
    expect(useAppStore.getState().isReady).toBe(false);
  });

  it('initialize() устанавливает isReady в true', () => {
    useAppStore.getState().initialize();
    expect(useAppStore.getState().isReady).toBe(true);
  });
});

import { act, renderHook } from '@testing-library/react-native';
import { useStoryViewer } from '../useStoryViewer';
import { Story } from '@/types';

const makeStory = (id: string): Story => ({
  id,
  title: `Story ${id}`,
  subtitle: null,
  image_url: `https://cdn.example.com/${id}.jpg`,
  type: 'promo',
  is_active: true,
  sort_order: 0,
  expires_at: null,
});

const stories = [makeStory('s1'), makeStory('s2'), makeStory('s3')];

const defaultProps = {
  stories,
  initialIndex: 0,
  visible: true,
  onClose: jest.fn(),
  onViewed: jest.fn(),
};

describe('useStoryViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- Начальное состояние ---

  it('начальный индекс соответствует initialIndex', () => {
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, initialIndex: 1 })
    );
    expect(result.current.currentIndex).toBe(1);
  });

  it('story соответствует текущему индексу', () => {
    const { result } = renderHook(() => useStoryViewer(defaultProps));
    expect(result.current.story?.id).toBe('s1');
  });

  it('story === undefined при пустом массиве', () => {
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, stories: [], initialIndex: 0 })
    );
    expect(result.current.story).toBeUndefined();
  });

  // --- Навигация ---

  it('goNext увеличивает индекс', () => {
    const { result } = renderHook(() => useStoryViewer(defaultProps));
    act(() => { result.current.goNext(); });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.story?.id).toBe('s2');
  });

  it('goNext на последней сторис вызывает onClose', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, initialIndex: 2, onClose })
    );
    act(() => { result.current.goNext(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('goPrev уменьшает индекс', () => {
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, initialIndex: 2 })
    );
    act(() => { result.current.goPrev(); });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.story?.id).toBe('s2');
  });

  it('goPrev на первой сторис ничего не делает', () => {
    const { result } = renderHook(() => useStoryViewer(defaultProps));
    act(() => { result.current.goPrev(); });
    expect(result.current.currentIndex).toBe(0);
  });

  // --- Закрытие ---

  it('handleClose вызывает onClose', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, onClose })
    );
    act(() => { result.current.handleClose(); });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // --- Сброс при открытии ---

  it('при visible: false → true сбрасывает currentIndex до initialIndex', () => {
    const { result, rerender } = renderHook(
      (props) => useStoryViewer(props),
      { initialProps: { ...defaultProps, visible: false } }
    );

    // Прокручиваем вперёд
    act(() => { result.current.goNext(); });
    expect(result.current.currentIndex).toBe(1);

    // Закрываем и снова открываем
    rerender({ ...defaultProps, visible: false, initialIndex: 0 });
    rerender({ ...defaultProps, visible: true, initialIndex: 0 });

    expect(result.current.currentIndex).toBe(0);
  });

  // --- onViewed ---

  it('вызывает onViewed с id текущей сторис при монтировании', () => {
    const onViewed = jest.fn();
    renderHook(() => useStoryViewer({ ...defaultProps, onViewed }));
    expect(onViewed).toHaveBeenCalledWith('s1');
  });

  it('вызывает onViewed при переходе к следующей сторис', () => {
    const onViewed = jest.fn();
    const { result } = renderHook(() =>
      useStoryViewer({ ...defaultProps, onViewed })
    );
    act(() => { result.current.goNext(); });
    expect(onViewed).toHaveBeenCalledWith('s2');
  });

  // --- Автопереход по таймеру ---

  it('через 5000мс автоматически переходит к следующей сторис', () => {
    const { result } = renderHook(() => useStoryViewer(defaultProps));

    expect(result.current.currentIndex).toBe(0);

    act(() => { jest.advanceTimersByTime(5000); });

    expect(result.current.currentIndex).toBe(1);
  });

  it('на последней сторис: через 5000мс вызывает onClose', () => {
    const onClose = jest.fn();
    renderHook(() =>
      useStoryViewer({ ...defaultProps, initialIndex: 2, onClose })
    );

    act(() => { jest.advanceTimersByTime(5000); });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('при unmount не вызывает onClose (анимация прерывается)', () => {
    const onClose = jest.fn();
    const { unmount } = renderHook(() =>
      useStoryViewer({ ...defaultProps, onClose })
    );

    unmount();
    act(() => { jest.advanceTimersByTime(5000); });

    expect(onClose).not.toHaveBeenCalled();
  });
});

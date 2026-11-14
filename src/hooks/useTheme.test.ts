import { act, renderHook } from '@testing-library/react';
import { THEME_STORAGE_KEY } from '../lib/storage';
import { useTheme } from './useTheme';

type ChangeListener = (event: MediaQueryListEvent) => void;

function mockSystemTheme(initialDark: boolean): (dark: boolean) => void {
  let matches = initialDark;
  const listeners = new Set<ChangeListener>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_type: 'change', listener: ChangeListener) => listeners.add(listener),
      removeEventListener: (_type: 'change', listener: ChangeListener) => listeners.delete(listener),
    })),
  );
  return (dark: boolean) => {
    matches = dark;
    listeners.forEach((listener) => listener({ matches: dark } as MediaQueryListEvent));
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
});

describe('useTheme', () => {
  it('follows the system theme by default without setting data-theme', () => {
    mockSystemTheme(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('reacts to system theme changes while there is no saved choice', () => {
    const setSystemDark = mockSystemTheme(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    act(() => setSystemDark(true));
    expect(result.current.theme).toBe('dark');
  });

  it('toggles, saves the choice and sets data-theme', () => {
    mockSystemTheme(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('applies a saved choice over the system theme and ignores system changes', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const setSystemDark = mockSystemTheme(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    act(() => setSystemDark(false));
    act(() => setSystemDark(true));
    expect(result.current.theme).toBe('light');
  });

  it('falls back to the system theme for an invalid saved value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    mockSystemTheme(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('defaults to light when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });
});

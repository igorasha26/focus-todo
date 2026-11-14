import { act, renderHook } from '@testing-library/react';
import { FILTER_STORAGE_KEY } from '../lib/storage';
import { changeStorageInOtherTab } from '../test/storageEvent';
import { useFilter } from './useFilter';

describe('useFilter: other tabs', () => {
  it('applies a filter selected in another tab', () => {
    const { result } = renderHook(() => useFilter());
    expect(result.current[0]).toBe('all');

    act(() => changeStorageInOtherTab(FILTER_STORAGE_KEY, 'completed'));
    expect(result.current[0]).toBe('completed');
  });

  it('falls back to "all" for an invalid value from another tab', () => {
    const { result } = renderHook(() => useFilter());
    act(() => result.current[1]('active'));
    act(() => changeStorageInOtherTab(FILTER_STORAGE_KEY, 'garbage'));
    expect(result.current[0]).toBe('all');
  });
});

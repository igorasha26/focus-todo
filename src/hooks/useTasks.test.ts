import { act, renderHook } from '@testing-library/react';
import { STORAGE_KEY } from '../lib/storage';
import type { Task } from '../model/types';
import { changeStorageInOtherTab } from '../test/storageEvent';
import { useTasks } from './useTasks';

const fromOtherTab: Task = { id: 'remote', title: 'Из другой вкладки', completed: true, createdAt: 1 };

describe('useTasks: other tabs', () => {
  it('loads tasks changed in another tab', () => {
    const { result } = renderHook(() => useTasks());
    act(() => result.current.addTask('Локальная'));
    expect(result.current.tasks).toHaveLength(1);

    act(() => changeStorageInOtherTab(STORAGE_KEY, JSON.stringify([fromOtherTab])));
    expect(result.current.tasks).toEqual([fromOtherTab]);
  });

  it('does not overwrite the other tab’s data on the next local change', () => {
    const { result } = renderHook(() => useTasks());
    act(() => changeStorageInOtherTab(STORAGE_KEY, JSON.stringify([fromOtherTab])));
    act(() => result.current.addTask('Новая'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Task[];
    expect(stored.map((task) => task.title)).toEqual(['Новая', 'Из другой вкладки']);
  });

  it('runs incoming data through the same validation as on load', () => {
    const { result } = renderHook(() => useTasks());
    act(() => changeStorageInOtherTab(STORAGE_KEY, '{broken json'));
    expect(result.current.tasks).toEqual([]);
  });

  it('ignores changes to other keys', () => {
    const { result } = renderHook(() => useTasks());
    act(() => result.current.addTask('Остаётся'));
    act(() => changeStorageInOtherTab('focus-todo:filter', 'active'));
    expect(result.current.tasks.map((task) => task.title)).toEqual(['Остаётся']);
  });
});

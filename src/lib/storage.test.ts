import type { Task } from '../model/types';
import {
  FILTER_STORAGE_KEY,
  STORAGE_KEY,
  THEME_STORAGE_KEY,
  loadFilter,
  loadTasks,
  loadTheme,
  saveFilter,
  saveTasks,
  saveTheme,
  subscribeToStorage,
} from './storage';
import { changeStorageInOtherTab } from '../test/storageEvent';

const validTask: Task = {
  id: '1',
  title: 'Задача',
  completed: false,
  createdAt: 1_700_000_000_000,
};

describe('storage', () => {
  it('returns an empty array when storage is empty', () => {
    expect(loadTasks()).toEqual([]);
  });

  it('returns an empty array for corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadTasks()).toEqual([]);
  });

  it.each([
    ['an object instead of an array', { tasks: [validTask] }],
    ['a string', 'tasks'],
    ['a number', 42],
    ['null', null],
  ])('returns an empty array when the stored value is not an array: %s', (_label, value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    expect(loadTasks()).toEqual([]);
  });

  it.each([
    ['a non-object entry', 'oops'],
    ['null entry', null],
    ['a task without id', { ...validTask, id: undefined }],
    ['a task with an empty id', { ...validTask, id: '' }],
    ['a task with an empty title', { ...validTask, id: 'e', title: '' }],
    ['a task with a whitespace-only title', { ...validTask, id: 'w', title: '   ' }],
    ['a task with a wrong completed type', { ...validTask, completed: 'yes' }],
    ['a task with a non-numeric createdAt', { ...validTask, createdAt: '2024-01-01' }],
  ])('drops an invalid entry and keeps the valid ones: %s', (_label, broken) => {
    const second: Task = { ...validTask, id: '2', title: 'Вторая' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([validTask, broken, second]));
    expect(loadTasks()).toEqual([validTask, second]);
  });

  it('returns an empty array when every entry is invalid', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ foo: 1 }, 'bar']));
    expect(loadTasks()).toEqual([]);
  });

  it('loads tasks saved earlier with the legacy priority field', () => {
    const legacy = [
      { ...validTask, priority: 'high' },
      { ...validTask, id: '2', title: 'Старая', completed: true, priority: 'low' },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const loaded = loadTasks();
    expect(loaded).toHaveLength(2);
    expect(loaded[0]).toMatchObject(validTask);
    expect(loaded[1]).toMatchObject({ id: '2', title: 'Старая', completed: true });
  });

  it('round-trips saved tasks', () => {
    const tasks: Task[] = [validTask, { ...validTask, id: '2', completed: true }];
    saveTasks(tasks);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(tasks));
    expect(loadTasks()).toEqual(tasks);
  });

  it('returns an empty array when localStorage throws on read', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadTasks()).toEqual([]);
    spy.mockRestore();
  });

  it('does not throw when localStorage throws on write', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveTasks([validTask])).not.toThrow();
    spy.mockRestore();
  });
});

describe('filter storage', () => {
  it('defaults to "all" when nothing is stored', () => {
    expect(loadFilter()).toBe('all');
  });

  it.each(['urgent', '', '"active"', '{broken', 'ALL'])('falls back to "all" for an unknown value: %j', (raw) => {
    localStorage.setItem(FILTER_STORAGE_KEY, raw);
    expect(loadFilter()).toBe('all');
  });

  it.each(['all', 'active', 'completed'] as const)('round-trips "%s"', (filter) => {
    saveFilter(filter);
    expect(localStorage.getItem(FILTER_STORAGE_KEY)).toBe(filter);
    expect(loadFilter()).toBe(filter);
  });

  it('falls back to "all" when localStorage throws on read', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadFilter()).toBe('all');
    spy.mockRestore();
  });

  it('does not throw when localStorage throws on write', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveFilter('active')).not.toThrow();
    spy.mockRestore();
  });
});

describe('theme storage', () => {
  it('returns null (follow the system) when nothing is stored', () => {
    expect(loadTheme()).toBeNull();
  });

  it.each(['blue', '', 'DARK', '"dark"'])('returns null for an unknown value: %j', (raw) => {
    localStorage.setItem(THEME_STORAGE_KEY, raw);
    expect(loadTheme()).toBeNull();
  });

  it.each(['light', 'dark'] as const)('round-trips "%s"', (theme) => {
    saveTheme(theme);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme);
    expect(loadTheme()).toBe(theme);
  });

  it('returns null when localStorage throws on read', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(loadTheme()).toBeNull();
    spy.mockRestore();
  });

  it('does not throw when localStorage throws on write', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveTheme('dark')).not.toThrow();
    spy.mockRestore();
  });
});

describe('loadTasks: duplicate ids', () => {
  it('keeps the first task for a repeated id and drops the rest', () => {
    const first: Task = { ...validTask, id: 'dup', title: 'Первая' };
    const copy: Task = { ...validTask, id: 'dup', title: 'Копия', completed: true };
    const other: Task = { ...validTask, id: 'other', title: 'Другая' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([first, other, copy]));
    expect(loadTasks()).toEqual([first, other]);
  });

  it('checks duplicates only among valid tasks', () => {
    const broken = { id: 'dup', title: '' };
    const valid: Task = { ...validTask, id: 'dup', title: 'Нормальная' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([broken, valid]));
    expect(loadTasks()).toEqual([valid]);
  });
});

describe('subscribeToStorage', () => {
  it('fires for its key and for a full clear, ignores other keys', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToStorage(STORAGE_KEY, onChange);

    changeStorageInOtherTab(FILTER_STORAGE_KEY, 'active');
    expect(onChange).not.toHaveBeenCalled();

    changeStorageInOtherTab(STORAGE_KEY, '[]');
    expect(onChange).toHaveBeenCalledTimes(1);

    changeStorageInOtherTab(null, null);
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    changeStorageInOtherTab(STORAGE_KEY, '[]');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

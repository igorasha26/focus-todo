import type { Task } from '../model/types';
import { STORAGE_KEY, loadTasks, saveTasks } from './storage';

const validTask: Task = {
  id: '1',
  title: 'Задача',
  completed: false,
  priority: 'high',
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
    ['a task with a wrong completed type', { ...validTask, completed: 'yes' }],
    ['a task with an unknown priority', { ...validTask, priority: 'urgent' }],
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

  it('round-trips saved tasks', () => {
    const tasks: Task[] = [validTask, { ...validTask, id: '2', completed: true, priority: 'low' }];
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

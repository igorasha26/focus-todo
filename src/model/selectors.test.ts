import { countCompleted, filterTasks } from './selectors';
import type { Task } from './types';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: `Задача ${overrides.id}`,
    completed: false,
    createdAt: 1_700_000_000_000,
    ...overrides,
  };
}

const a = makeTask({ id: 'a' });
const b = makeTask({ id: 'b', completed: true });
const c = makeTask({ id: 'c' });
const initial: Task[] = [a, b, c];

describe('filterTasks', () => {
  it('returns all tasks for "all"', () => {
    expect(filterTasks(initial, 'all')).toBe(initial);
  });

  it('returns only active tasks for "active"', () => {
    expect(filterTasks(initial, 'active')).toEqual([a, c]);
  });

  it('returns only completed tasks for "completed"', () => {
    expect(filterTasks(initial, 'completed')).toEqual([b]);
  });
});

describe('countCompleted', () => {
  it('counts completed tasks', () => {
    expect(countCompleted(initial)).toBe(1);
    expect(countCompleted([])).toBe(0);
  });
});

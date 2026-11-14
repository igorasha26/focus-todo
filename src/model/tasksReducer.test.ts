import {
  addTask,
  clearCompleted,
  editTask,
  reorderTasks,
  removeTask,
  setTaskPriority,
  tasksReducer,
  toggleTask,
} from './tasksReducer';
import type { Task } from './types';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    title: `Задача ${overrides.id}`,
    completed: false,
    priority: 'medium',
    createdAt: 1_700_000_000_000,
    ...overrides,
  };
}

const a = makeTask({ id: 'a' });
const b = makeTask({ id: 'b', completed: true });
const c = makeTask({ id: 'c', priority: 'high' });
const initial: Task[] = [a, b, c];

describe('addTask', () => {
  it('prepends a new active task with a trimmed title', () => {
    const next = addTask(initial, { id: 'n', title: '  Купить молоко  ', priority: 'low', createdAt: 42 });
    expect(next).toHaveLength(4);
    expect(next[0]).toEqual({ id: 'n', title: 'Купить молоко', completed: false, priority: 'low', createdAt: 42 });
    expect(next.slice(1)).toEqual(initial);
  });

  it('ignores a blank title', () => {
    expect(addTask(initial, { id: 'n', title: '   ', priority: 'low', createdAt: 42 })).toBe(initial);
  });

  it('does not mutate the original state', () => {
    const snapshot = structuredClone(initial);
    addTask(initial, { id: 'n', title: 'Новая', priority: 'low', createdAt: 42 });
    expect(initial).toEqual(snapshot);
  });
});

describe('toggleTask', () => {
  it('flips completed for the matching task only', () => {
    const next = toggleTask(initial, 'a');
    expect(next[0]?.completed).toBe(true);
    expect(next[1]).toBe(b);
    expect(next[2]).toBe(c);
    expect(toggleTask(next, 'a')[0]?.completed).toBe(false);
  });

  it('returns the same state for an unknown id', () => {
    expect(toggleTask(initial, 'missing')).toBe(initial);
  });
});

describe('removeTask', () => {
  it('removes the matching task', () => {
    expect(removeTask(initial, 'b')).toEqual([a, c]);
  });

  it('returns the same state for an unknown id', () => {
    expect(removeTask(initial, 'missing')).toBe(initial);
  });
});

describe('editTask', () => {
  it('updates the title with trimming', () => {
    const next = editTask(initial, 'c', '  Новое название ');
    expect(next[2]).toEqual({ ...c, title: 'Новое название' });
    expect(next[0]).toBe(a);
  });

  it('treats a blank title as cancel', () => {
    expect(editTask(initial, 'c', '   ')).toBe(initial);
  });

  it('returns the same state when the title is unchanged', () => {
    expect(editTask(initial, 'a', ` ${a.title} `)).toBe(initial);
  });

  it('returns the same state for an unknown id', () => {
    expect(editTask(initial, 'missing', 'Текст')).toBe(initial);
  });
});

describe('setTaskPriority', () => {
  it('changes the priority of the matching task', () => {
    const next = setTaskPriority(initial, 'a', 'high');
    expect(next[0]).toEqual({ ...a, priority: 'high' });
    expect(next[1]).toBe(b);
  });

  it('returns the same state when the priority is unchanged', () => {
    expect(setTaskPriority(initial, 'c', 'high')).toBe(initial);
  });

  it('returns the same state for an unknown id', () => {
    expect(setTaskPriority(initial, 'missing', 'low')).toBe(initial);
  });
});

describe('reorderTasks', () => {
  it('moves a task down', () => {
    expect(reorderTasks(initial, 'a', 'c').map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('moves a task up', () => {
    expect(reorderTasks(initial, 'c', 'a').map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('returns the same state when ids match', () => {
    expect(reorderTasks(initial, 'b', 'b')).toBe(initial);
  });

  it('returns the same state when an id is unknown', () => {
    expect(reorderTasks(initial, 'missing', 'a')).toBe(initial);
    expect(reorderTasks(initial, 'a', 'missing')).toBe(initial);
  });
});

describe('clearCompleted', () => {
  it('removes all completed tasks', () => {
    expect(clearCompleted(initial)).toEqual([a, c]);
  });

  it('returns the same state when nothing is completed', () => {
    const active = [a, c];
    expect(clearCompleted(active)).toBe(active);
  });
});

describe('tasksReducer', () => {
  it('dispatches every action type to its handler', () => {
    let state = tasksReducer([], { type: 'add', payload: { id: 'x', title: 'Первая', priority: 'medium', createdAt: 1 } });
    state = tasksReducer(state, { type: 'add', payload: { id: 'y', title: 'Вторая', priority: 'low', createdAt: 2 } });
    expect(state.map((t) => t.id)).toEqual(['y', 'x']);

    state = tasksReducer(state, { type: 'toggle', payload: { id: 'x' } });
    expect(state[1]?.completed).toBe(true);

    state = tasksReducer(state, { type: 'edit', payload: { id: 'y', title: 'Вторая (изм.)' } });
    expect(state[0]?.title).toBe('Вторая (изм.)');

    state = tasksReducer(state, { type: 'setPriority', payload: { id: 'y', priority: 'high' } });
    expect(state[0]?.priority).toBe('high');

    state = tasksReducer(state, { type: 'reorder', payload: { activeId: 'y', overId: 'x' } });
    expect(state.map((t) => t.id)).toEqual(['x', 'y']);

    state = tasksReducer(state, { type: 'clearCompleted' });
    expect(state.map((t) => t.id)).toEqual(['y']);

    state = tasksReducer(state, { type: 'remove', payload: { id: 'y' } });
    expect(state).toEqual([]);
  });
});

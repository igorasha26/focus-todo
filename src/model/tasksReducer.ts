import type { Task } from './types';

export type TasksAction =
  | { type: 'add'; payload: { id: string; title: string; createdAt: number } }
  | { type: 'toggle'; payload: { id: string } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'clearCompleted' };

export function addTask(
  state: Task[],
  payload: Extract<TasksAction, { type: 'add' }>['payload'],
): Task[] {
  const title = payload.title.trim();
  if (title === '') {
    return state;
  }
  const task: Task = {
    id: payload.id,
    title,
    completed: false,
    createdAt: payload.createdAt,
  };
  return [task, ...state];
}

export function toggleTask(state: Task[], id: string): Task[] {
  if (!state.some((task) => task.id === id)) {
    return state;
  }
  return state.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

export function removeTask(state: Task[], id: string): Task[] {
  const next = state.filter((task) => task.id !== id);
  return next.length === state.length ? state : next;
}

export function clearCompleted(state: Task[]): Task[] {
  const next = state.filter((task) => !task.completed);
  return next.length === state.length ? state : next;
}

export function tasksReducer(state: Task[], action: TasksAction): Task[] {
  switch (action.type) {
    case 'add':
      return addTask(state, action.payload);
    case 'toggle':
      return toggleTask(state, action.payload.id);
    case 'remove':
      return removeTask(state, action.payload.id);
    case 'clearCompleted':
      return clearCompleted(state);
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

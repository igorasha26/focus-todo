import type { Priority, Task } from './types';

export type TasksAction =
  | { type: 'add'; payload: { id: string; title: string; priority: Priority; createdAt: number } }
  | { type: 'toggle'; payload: { id: string } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'edit'; payload: { id: string; title: string } }
  | { type: 'setPriority'; payload: { id: string; priority: Priority } }
  | { type: 'reorder'; payload: { activeId: string; overId: string } }
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
    priority: payload.priority,
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

export function editTask(state: Task[], id: string, title: string): Task[] {
  const trimmed = title.trim();
  const target = state.find((task) => task.id === id);
  if (trimmed === '' || !target || target.title === trimmed) {
    return state;
  }
  return state.map((task) => (task.id === id ? { ...task, title: trimmed } : task));
}

export function setTaskPriority(state: Task[], id: string, priority: Priority): Task[] {
  const target = state.find((task) => task.id === id);
  if (!target || target.priority === priority) {
    return state;
  }
  return state.map((task) => (task.id === id ? { ...task, priority } : task));
}

export function reorderTasks(state: Task[], activeId: string, overId: string): Task[] {
  if (activeId === overId) {
    return state;
  }
  const from = state.findIndex((task) => task.id === activeId);
  const to = state.findIndex((task) => task.id === overId);
  if (from === -1 || to === -1) {
    return state;
  }
  const next = [...state];
  const [moved] = next.splice(from, 1);
  if (!moved) {
    return state;
  }
  next.splice(to, 0, moved);
  return next;
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
    case 'edit':
      return editTask(state, action.payload.id, action.payload.title);
    case 'setPriority':
      return setTaskPriority(state, action.payload.id, action.payload.priority);
    case 'reorder':
      return reorderTasks(state, action.payload.activeId, action.payload.overId);
    case 'clearCompleted':
      return clearCompleted(state);
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

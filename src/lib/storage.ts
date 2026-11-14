import { isFilter, isTask, type Filter, type Task } from '../model/types';

export const STORAGE_KEY = 'focus-todo:v1';
export const FILTER_STORAGE_KEY = 'focus-todo:filter';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage unavailable: the app keeps working in memory.
  }
}

export function loadFilter(): Filter {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    return isFilter(raw) ? raw : 'all';
  } catch {
    return 'all';
  }
}

export function saveFilter(filter: Filter): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  } catch {
    // Storage unavailable: the filter just won't survive a reload.
  }
}

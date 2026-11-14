import { isFilter, isTask, isTheme, type Filter, type Task, type Theme } from '../model/types';

export const STORAGE_KEY = 'focus-todo:v1';
export const FILTER_STORAGE_KEY = 'focus-todo:filter';
export const THEME_STORAGE_KEY = 'focus-todo:theme';

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
    const seenIds = new Set<string>();
    return parsed.filter(isTask).filter((task) => {
      if (seenIds.has(task.id)) {
        return false;
      }
      seenIds.add(task.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage недоступен — данные просто не сохранятся
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
    // localStorage недоступен — данные просто не сохранятся
  }
}

export function loadTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage недоступен — данные просто не сохранятся
  }
}

export function subscribeToStorage(key: string, onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) {
      onChange();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}

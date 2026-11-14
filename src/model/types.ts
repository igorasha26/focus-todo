export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type Filter = 'all' | 'active' | 'completed';

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  );
}

export const FILTERS: readonly Filter[] = ['all', 'active', 'completed'];

export function isFilter(value: unknown): value is Filter {
  return typeof value === 'string' && (FILTERS as readonly string[]).includes(value);
}

export type Theme = 'light' | 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

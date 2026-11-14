export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

export type Filter = 'all' | 'active' | 'completed';

export const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

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
    isPriority(candidate.priority) &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  );
}

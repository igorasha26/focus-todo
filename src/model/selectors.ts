import type { Filter, Task } from './types';

export function filterTasks(tasks: Task[], filter: Filter): Task[] {
  switch (filter) {
    case 'all':
      return tasks;
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default: {
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

export function countCompleted(tasks: Task[]): number {
  return tasks.filter((task) => task.completed).length;
}

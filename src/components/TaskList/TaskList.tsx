import { useEffect, useRef, type RefObject } from 'react';
import type { Task } from '../../model/types';
import { TaskItem } from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  emptyMessage: string;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  focusFallbackRef: RefObject<HTMLElement>;
}

export function TaskList({ tasks, emptyMessage, onToggle, onRemove, focusFallbackRef }: TaskListProps) {
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());

  const pendingFocus = useRef<{ id: string | null } | null>(null);

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) {
      return;
    }
    pendingFocus.current = null;
    const target = pending.id === null ? undefined : removeButtons.current.get(pending.id);
    (target ?? focusFallbackRef.current)?.focus();
  }, [tasks, focusFallbackRef]);

  const handleRemove = (id: string) => {
    const index = tasks.findIndex((task) => task.id === id);
    const neighbour = tasks[index + 1] ?? tasks[index - 1];
    pendingFocus.current = { id: neighbour?.id ?? null };
    onRemove(id);
  };

  const registerRemoveButton = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      removeButtons.current.set(id, element);
    } else {
      removeButtons.current.delete(id);
    }
  };

  if (tasks.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <ul className={styles.list} aria-label="Список задач">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRemove={handleRemove}
          removeButtonRef={registerRemoveButton(task.id)}
        />
      ))}
    </ul>
  );
}

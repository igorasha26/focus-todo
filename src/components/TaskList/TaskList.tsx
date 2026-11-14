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

type Control = 'checkbox' | 'remove';

interface PendingFocus {
  taskId: string;
  control: Control;
  neighbourIds: string[];
}

export function TaskList({ tasks, emptyMessage, onToggle, onRemove, focusFallbackRef }: TaskListProps) {
  const controls = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<PendingFocus | null>(null);

  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) {
      return;
    }
    pendingFocus.current = null;
    if (tasks.some((task) => task.id === pending.taskId)) {
      return;
    }
    const target = pending.neighbourIds
      .map((id) => controls.current.get(`${pending.control}:${id}`))
      .find((element) => element !== undefined);
    (target ?? focusFallbackRef.current)?.focus();
  }, [tasks, focusFallbackRef]);

  const rememberFocus = (taskId: string, control: Control) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    const neighbourIds = [tasks[index + 1], tasks[index - 1]]
      .filter((task): task is Task => task !== undefined)
      .map((task) => task.id);
    pendingFocus.current = { taskId, control, neighbourIds };
  };

  const handleToggle = (id: string) => {
    rememberFocus(id, 'checkbox');
    onToggle(id);
  };

  const handleRemove = (id: string) => {
    rememberFocus(id, 'remove');
    onRemove(id);
  };

  const registerControl = (control: Control, id: string) => (element: HTMLElement | null) => {
    const key = `${control}:${id}`;
    if (element) {
      controls.current.set(key, element);
    } else {
      controls.current.delete(key);
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
          onToggle={handleToggle}
          onRemove={handleRemove}
          checkboxRef={registerControl('checkbox', task.id)}
          removeButtonRef={registerControl('remove', task.id)}
        />
      ))}
    </ul>
  );
}

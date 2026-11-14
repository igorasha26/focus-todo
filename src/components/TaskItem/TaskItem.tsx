import type { Task } from '../../model/types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  removeButtonRef?: (element: HTMLButtonElement | null) => void;
}

export function TaskItem({ task, onToggle, onRemove, removeButtonRef }: TaskItemProps) {
  const checkboxId = `task-${task.id}`;
  const cardClass = [styles.card, task.completed ? styles.completed : ''].join(' ');

  return (
    <li className={cardClass}>
      <input
        id={checkboxId}
        className={styles.checkbox}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <label htmlFor={checkboxId} className={styles.title}>
        {task.title}
      </label>
      <button
        ref={removeButtonRef}
        className={styles.remove}
        type="button"
        onClick={() => onRemove(task.id)}
        aria-label={`Удалить задачу «${task.title}»`}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}

import styles from './TaskSummary.module.css';

interface TaskSummaryProps {
  completed: number;
  total: number;
  onClearCompleted: () => void;
}

export function TaskSummary({ completed, total, onClearCompleted }: TaskSummaryProps) {
  return (
    <div className={styles.summary}>
      <p className={styles.counter} aria-live="polite">
        Вы выполнили {completed}/{total} задач
      </p>
      <button
        type="button"
        className={styles.clear}
        onClick={onClearCompleted}
        disabled={completed === 0}
        aria-label="Очистить выполненные"
      >
        Очистить выполненные
      </button>
    </div>
  );
}

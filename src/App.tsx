import { useMemo, useRef } from 'react';
import { FilterBar } from './components/FilterBar/FilterBar';
import { TaskInput } from './components/TaskInput/TaskInput';
import { TaskList } from './components/TaskList/TaskList';
import { TaskSummary } from './components/TaskSummary/TaskSummary';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { useFilter } from './hooks/useFilter';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import { countCompleted, filterTasks } from './model/selectors';
import type { Filter } from './model/types';
import styles from './App.module.css';

function getEmptyMessage(totalTasks: number, filter: Filter): string {
  if (totalTasks === 0) {
    return 'Задач пока нет — добавьте первую';
  }
  return filter === 'completed' ? 'Нет выполненных задач' : 'Все задачи выполнены';
}

export function App() {
  const { tasks, addTask, toggleTask, removeTask, clearCompleted } = useTasks();
  const [filter, setFilter] = useFilter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const completedCount = countCompleted(tasks);

  const handleClearCompleted = () => {
    clearCompleted();
    inputRef.current?.focus();
  };

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Мои задачи</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>
      <FilterBar value={filter} onChange={setFilter} />
      <div className={styles.compose}>
        <TaskInput onAdd={addTask} inputRef={inputRef} />
        <TaskSummary completed={completedCount} total={tasks.length} onClearCompleted={handleClearCompleted} />
      </div>
      <TaskList
        tasks={visibleTasks}
        emptyMessage={getEmptyMessage(tasks.length, filter)}
        onToggle={toggleTask}
        onRemove={removeTask}
        focusFallbackRef={inputRef}
      />
    </main>
  );
}

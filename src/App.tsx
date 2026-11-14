import { FilterBar } from './components/FilterBar/FilterBar';
import { TaskInput } from './components/TaskInput/TaskInput';
import { TaskList } from './components/TaskList/TaskList';
import { TaskSummary } from './components/TaskSummary/TaskSummary';
import { useFilter } from './hooks/useFilter';
import { useTasks } from './hooks/useTasks';
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

  const visibleTasks = filterTasks(tasks, filter);
  const completedCount = countCompleted(tasks);

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Мои задачи</h1>
      <FilterBar value={filter} onChange={setFilter} />
      <div className={styles.compose}>
        <TaskInput onAdd={addTask} />
        <TaskSummary completed={completedCount} total={tasks.length} onClearCompleted={clearCompleted} />
      </div>
      <TaskList
        tasks={visibleTasks}
        emptyMessage={getEmptyMessage(tasks.length, filter)}
        onToggle={toggleTask}
        onRemove={removeTask}
      />
    </main>
  );
}

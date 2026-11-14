import { TaskInput } from './components/TaskInput/TaskInput';
import { TaskList } from './components/TaskList/TaskList';
import { useTasks } from './hooks/useTasks';
import styles from './App.module.css';

export function App() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Мои задачи</h1>
      <TaskInput onAdd={addTask} />
      <TaskList tasks={tasks} onToggle={toggleTask} onRemove={removeTask} />
    </main>
  );
}

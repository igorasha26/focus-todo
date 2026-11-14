import { useCallback, useEffect, useReducer } from 'react';
import { loadTasks, saveTasks } from '../lib/storage';
import { tasksReducer } from '../model/tasksReducer';
import type { Priority, Task } from '../model/types';

interface UseTasksResult {
  tasks: Task[];
  addTask: (title: string, priority?: Priority) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

export function useTasks(): UseTasksResult {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((title: string, priority: Priority = 'medium') => {
    dispatch({
      type: 'add',
      payload: { id: crypto.randomUUID(), title, priority, createdAt: Date.now() },
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'toggle', payload: { id } });
  }, []);

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'remove', payload: { id } });
  }, []);

  return { tasks, addTask, toggleTask, removeTask };
}

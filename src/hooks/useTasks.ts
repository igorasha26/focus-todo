import { useCallback, useEffect, useReducer } from 'react';
import { STORAGE_KEY, loadTasks, saveTasks, subscribeToStorage } from '../lib/storage';
import { tasksReducer } from '../model/tasksReducer';
import type { Task } from '../model/types';

interface UseTasksResult {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

export function useTasks(): UseTasksResult {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(
    () => subscribeToStorage(STORAGE_KEY, () => dispatch({ type: 'replace', payload: { tasks: loadTasks() } })),
    [],
  );

  const addTask = useCallback((title: string) => {
    dispatch({
      type: 'add',
      payload: { id: crypto.randomUUID(), title, createdAt: Date.now() },
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'toggle', payload: { id } });
  }, []);

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'remove', payload: { id } });
  }, []);

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'clearCompleted' });
  }, []);

  return { tasks, addTask, toggleTask, removeTask, clearCompleted };
}

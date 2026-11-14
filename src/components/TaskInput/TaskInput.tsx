import { useState, type FormEvent } from 'react';
import styles from './TaskInput.module.css';

interface TaskInputProps {
  onAdd: (title: string) => void;
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');
  const isEmpty = value.trim() === '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEmpty) {
      return;
    }
    onAdd(value.trim());
    setValue('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Что нужно сделать?"
        aria-label="Новая задача"
        autoComplete="off"
        maxLength={200}
      />
      <button className={styles.button} type="submit" disabled={isEmpty} aria-label="Добавить задачу">
        Добавить
      </button>
    </form>
  );
}

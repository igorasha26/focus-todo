import { useState, type FormEvent, type RefObject } from 'react';
import styles from './TaskInput.module.css';

interface TaskInputProps {
  onAdd: (title: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

export function TaskInput({ onAdd, inputRef }: TaskInputProps) {
  const [value, setValue] = useState('');
  const isEmpty = value.trim() === '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEmpty) {
      return;
    }
    onAdd(value.trim());
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Что нужно сделать?"
        aria-label="Новая задача"
        autoComplete="off"
        maxLength={200}
        autoFocus
      />
      <button className={styles.button} type="submit" disabled={isEmpty} aria-label="Добавить задачу">
        Добавить
      </button>
    </form>
  );
}

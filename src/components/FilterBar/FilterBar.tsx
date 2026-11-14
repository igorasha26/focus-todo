import type { Filter } from '../../model/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  value: Filter;
  onChange: (filter: Filter) => void;
}

interface FilterOption {
  value: Filter;
  label: string;
  ariaLabel: string;
}

const OPTIONS: readonly FilterOption[] = [
  { value: 'all', label: 'Все', ariaLabel: 'Все задачи' },
  { value: 'active', label: 'Активные', ariaLabel: 'Активные задачи' },
  { value: 'completed', label: 'Выполненные', ariaLabel: 'Выполненные задачи' },
];

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div className={styles.group} role="group" aria-label="Фильтр задач">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`${styles.button} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

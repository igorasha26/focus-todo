import { useState } from 'react';
import type { Theme } from '../../model/types';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

interface IconProps {
  className?: string;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const [hasToggled, setHasToggled] = useState(false);
  const label = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
  const iconClass = hasToggled ? styles.iconAnimated : undefined;

  const handleClick = () => {
    setHasToggled(true);
    onToggle();
  };

  return (
    <button type="button" className={styles.toggle} onClick={handleClick} aria-label={label} title={label}>
      {theme === 'dark' ? <SunIcon className={iconClass} /> : <MoonIcon className={iconClass} />}
    </button>
  );
}

function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import type { UnitSystem } from '../../types/weather';
import styles from './UnitToggle.module.css';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (units: UnitSystem) => void;
}

const OPTIONS: ReadonlyArray<{ value: UnitSystem; label: string; description: string }> = [
  { value: 'metric', label: '°C', description: 'Celsius' },
  { value: 'imperial', label: '°F', description: 'Fahrenheit' },
];

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className={styles.group} role="group" aria-label="Temperature unit">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={value === option.value}
          aria-label={option.description}
          title={option.description}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

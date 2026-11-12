import { LoaderCircle, LocateFixed } from 'lucide-react';
import shared from '../../styles/shared.module.css';
import styles from './LocationButton.module.css';

interface LocationButtonProps {
  isLocating: boolean;
  onClick: () => void;
}

export function LocationButton({ isLocating, onClick }: LocationButtonProps) {
  return (
    <button
      type="button"
      className={`${shared.ghostButton} ${styles.button}`}
      onClick={onClick}
      disabled={isLocating}
      aria-busy={isLocating}
    >
      {isLocating ? (
        <LoaderCircle className={styles.spinner} size={18} aria-hidden="true" />
      ) : (
        <LocateFixed size={18} aria-hidden="true" />
      )}
      <span className={styles.label}>{isLocating ? 'Locating…' : 'Use my location'}</span>
    </button>
  );
}

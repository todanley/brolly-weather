import { CloudOff, LocateOff, RotateCw, TriangleAlert, WifiOff, X } from 'lucide-react';
import { describeError, type AppError } from '../../api/errors';
import shared from '../../styles/shared.module.css';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  /** Inline banner instead of a full panel. */
  compact?: boolean;
}

function iconFor(error: AppError) {
  switch (error.kind) {
    case 'offline':
      return WifiOff;
    case 'network':
    case 'timeout':
      return CloudOff;
    case 'geolocation-denied':
    case 'geolocation-unavailable':
    case 'geolocation-unsupported':
      return LocateOff;
    default:
      return TriangleAlert;
  }
}

export function ErrorState({ error, onRetry, onDismiss, compact = false }: ErrorStateProps) {
  const { title, description } = describeError(error);
  const Icon = iconFor(error);
  const canRetry = Boolean(onRetry) && error.retryable;

  return (
    <div className={`${shared.card} ${compact ? styles.compact : styles.panel}`} role="alert">
      <Icon className={styles.icon} size={compact ? 20 : 36} strokeWidth={1.6} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.actions}>
        {canRetry && (
          <button type="button" className={shared.primaryButton} onClick={onRetry}>
            <RotateCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}
        {onDismiss && (
          <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

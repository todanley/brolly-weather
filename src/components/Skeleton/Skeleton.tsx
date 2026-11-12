import type { CSSProperties } from 'react';
import shared from '../../styles/shared.module.css';
import styles from './Skeleton.module.css';

interface BlockProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
}

export function SkeletonBlock({ width = '100%', height = 14, radius = 6 }: BlockProps) {
  return <span className={styles.block} style={{ width, height, borderRadius: radius }} />;
}

export function SuggestionSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.suggestions} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className={styles.suggestionRow}>
          <SkeletonBlock width={16} height={16} radius="50%" />
          <div className={styles.stack}>
            <SkeletonBlock width={`${50 - index * 8}%`} height={14} />
            <SkeletonBlock width={`${35 + index * 6}%`} height={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mirrors the real weather layout so content doesn't jump when data arrives. */
export function WeatherSkeleton() {
  return (
    <div className={styles.weather} role="status" aria-busy="true" aria-label="Loading weather">
      <section className={`${shared.card} ${styles.current}`}>
        <SkeletonBlock width="45%" height={30} />
        <SkeletonBlock width="30%" height={14} />
        <div className={styles.heroRow}>
          <SkeletonBlock width={140} height={88} radius={14} />
          <SkeletonBlock width={72} height={72} radius="50%" />
        </div>
        <div className={styles.metrics}>
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} height={52} radius={12} />
          ))}
        </div>
      </section>

      <section className={`${shared.card} ${styles.hourly}`}>
        <SkeletonBlock width={110} height={12} />
        <div className={styles.hourlyRow}>
          {Array.from({ length: 10 }, (_, index) => (
            <SkeletonBlock key={index} width={56} height={92} radius={14} />
          ))}
        </div>
      </section>

      <section className={`${shared.card} ${styles.daily}`}>
        <SkeletonBlock width={110} height={12} />
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonBlock key={index} height={36} radius={10} />
        ))}
      </section>
    </div>
  );
}

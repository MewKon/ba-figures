import type { ReactNode } from 'react';
import { Halo } from './Halo';
import styles from './EmptyState.module.css';

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.haloWrap}>
        <Halo size={88} thickness={3} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {hint && <p className={styles.hint}>{hint}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

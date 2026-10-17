/** 斜切平行四边形徽章 —— BA 的条幅/标签语言 */
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Tone = 'blue' | 'own' | 'green' | 'char' | 'muted';

export function Badge({
  children,
  tone = 'blue',
  color,
}: {
  children: ReactNode;
  tone?: Tone;
  /** tone='char' 时用角色主题色 */
  color?: string;
}) {
  return (
    <span
      className={`${styles.badge} ${styles[tone]}`}
      style={tone === 'char' && color ? ({ ['--badge-c' as string]: color }) : undefined}
    >
      <span className={styles.inner}>{children}</span>
    </span>
  );
}

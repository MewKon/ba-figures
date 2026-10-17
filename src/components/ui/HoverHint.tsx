/**
 * 轻量 hover 提示：包住触发元素，悬停/聚焦时浮出说明文字。
 * 纯 CSS 实现（.hint:hover .tip），无 JS 状态 —— 触发元素永远可正常点击。
 */
import type { ReactNode } from 'react';
import styles from './HoverHint.module.css';

export function HoverHint({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className={styles.hint} tabIndex={0} aria-label={text}>
      {children}
      <span className={styles.tip} role="tooltip">
        {text}
      </span>
    </span>
  );
}

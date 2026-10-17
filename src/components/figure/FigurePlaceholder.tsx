/**
 * 无图片时的占位视觉：角色主题色渐变 + 首字 + 光环。
 * themeColor 是必填字段 —— 这条降级路径永远可用，不依赖任何外部图片。
 */
import type { CSSProperties } from 'react';
import type { Figure } from '../../types/figure';
import { Halo } from '../ui/Halo';
import styles from './FigurePlaceholder.module.css';

export function FigurePlaceholder({ figure, large = false }: { figure: Figure; large?: boolean }) {
  // 展开取首字，避免把代理对（emoji 等）截断成半个字符
  const initial = [...figure.characterName][0] ?? '?';

  return (
    <div
      className={`${styles.ph} ${large ? styles.large : ''}`}
      style={{ ['--c' as string]: figure.themeColor } as CSSProperties}
      role="img"
      aria-label={`${figure.characterName}（暂无图片）`}
    >
      <span className={styles.ring}>
        <Halo size={large ? 150 : 88} thickness={large ? 3 : 2} animated={false} />
      </span>
      <span className={styles.initial}>{initial}</span>
      <span className={styles.sub}>{figure.characterNameJa}</span>
    </div>
  );
}

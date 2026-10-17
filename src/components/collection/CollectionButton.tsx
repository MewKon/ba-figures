/**
 * 收藏按钮（单一「收藏」标记）。
 * variant='icon' 用于卡片角标；variant='full' 用于详情页正文按钮。
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Figure } from '../../types/figure';
import { COLLECTION_LABEL } from '../../types/figure';
import { useCollection } from '../../hooks/useCollection';
import styles from './CollectionButton.module.css';

const ICON = '★';

export function CollectionButton({
  figure,
  variant = 'full',
}: {
  figure: Figure;
  variant?: 'icon' | 'full';
}) {
  const { has, toggle } = useCollection();
  const reduce = useReducedMotion();
  const active = has(figure.id);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(figure.id);
  };

  if (variant === 'icon') {
    return (
      <div className={styles.iconWrap}>
        <motion.button
          type="button"
          className={`${styles.icon} ${active ? styles.on : ''}`}
          onClick={handle}
          whileTap={reduce ? undefined : { scale: 0.86 }}
          title={COLLECTION_LABEL.owned}
          aria-pressed={active}
        >
          <span aria-hidden="true">{ICON}</span>
          <span className="sr-only">
            {COLLECTION_LABEL.owned}
            {active ? '（已收藏，点击取消）' : ''}
          </span>
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      className={`${styles.pill} ${active ? styles.on : ''}`}
      onClick={handle}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      aria-pressed={active}
    >
      <span aria-hidden="true" className={styles.pillIcon}>
        {ICON}
      </span>
      {active ? '已收藏' : COLLECTION_LABEL.owned}
      <AnimatePresence>
        {active && !reduce && (
          <motion.span
            className={styles.flash}
            initial={{ opacity: 0.9, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

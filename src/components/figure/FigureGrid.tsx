import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Figure } from '../../types/figure';
import { FigureCard } from './FigureCard';
import styles from './FigureGrid.module.css';

/**
 * 画廊网格。
 * - 卡片用 whileInView 入场：只有滚进视口的才播动画，长列表尾部的卡片
 *   不再排队等 stagger（排队时用户看到的就是「图片加载完了卡片还不出来」）
 * - layout + AnimatePresence：筛选/排序变化时卡片平滑滑动到新位置
 */
export function FigureGrid({ figures }: { figures: Figure[] }) {
  const reduce = useReducedMotion();

  return (
    <div className={styles.grid}>
      <AnimatePresence mode="popLayout" initial={false}>
        {figures.map((f, i) => (
          <motion.div
            key={f.id}
            layout={!reduce}
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            // once：入过场就不重播；首屏内前 12 张给一点点错峰，其余立即
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={
              reduce
                ? undefined
                : { type: 'spring', stiffness: 260, damping: 26, delay: i < 12 ? i * 0.012 : 0 }
            }
            exit={reduce ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
          >
            <FigureCard figure={f} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

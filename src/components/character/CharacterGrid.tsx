import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { CharacterGroup } from '../../data/characters';
import { CharacterCard } from './CharacterCard';
import styles from './CharacterGrid.module.css';

/** 角色网格：比手办网格更密（角色是入口，一屏看更多）。
 *  卡片 whileInView 入场 —— 124 张角色卡不排队，滚到哪亮到哪。 */
export function CharacterGrid({ groups }: { groups: CharacterGroup[] }) {
  const reduce = useReducedMotion();

  return (
    <div className={styles.grid}>
      <AnimatePresence mode="popLayout" initial={false}>
        {groups.map((g, i) => (
          <motion.div
            key={g.id}
            layout={!reduce}
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={
              reduce
                ? undefined
                : { type: 'spring', stiffness: 280, damping: 26, delay: i < 14 ? i * 0.01 : 0 }
            }
            exit={reduce ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
          >
            {/* 首屏（前两行 ~14 张）立即加载高优先级，其余懒加载 */}
            <CharacterCard group={g} priority={i < 14} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

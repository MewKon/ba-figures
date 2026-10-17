import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import type { CharacterGroup } from '../../data/characters';
import { CharacterPortrait } from './CharacterPortrait';
import styles from './CharacterCard.module.css';

/** 角色入口卡：官方立绘 + 中文名 + 手办数 */
export function CharacterCard({ group, priority = false }: { group: CharacterGroup; priority?: boolean }) {
  const reduce = useReducedMotion();
  // 立绘缺失时的占位数据源（取该角色一件手办的主题色与名字）；0 件角色没有手办可取
  const repr = group.items.find((f) => f.imageUrl) ?? group.items[0];

  return (
    <motion.div
      className={`${styles.wrap} ${group.count === 0 ? styles.zero : ''}`}
      style={{ ['--c' as string]: group.themeColor }}
      layout={!reduce}
    >
      <Link to={`/character/${group.id}`} className={styles.link}>
        <div className={styles.media}>
          <CharacterPortrait
            characterId={group.id}
            priority={priority}
            name={group.nameZh}
            nameJa={group.nameJa}
            themeColor={group.themeColor}
            fallback={repr}
          />
          <span className={`${styles.count} ${group.count === 0 ? styles.countZero : ''}`}>
            <strong>{group.count}</strong> 件
          </span>
          <span className={styles.school}>{group.series}</span>
        </div>
        <div className={styles.body}>
          <h3 className={`${styles.name} ellipsis`}>{group.nameZh}</h3>
          <p className={`${styles.ja} ellipsis`}>{group.nameJa}</p>
        </div>
      </Link>
    </motion.div>
  );
}

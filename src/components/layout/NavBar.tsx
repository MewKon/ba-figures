import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useCollection } from '../../hooks/useCollection';
import { CurrencyPicker } from './CurrencyPicker';
import styles from './NavBar.module.css';

const LINKS = [
  { to: '/', label: '手办画廊', end: true },
  { to: '/calendar', label: '发售日历', end: false },
  { to: '/collection', label: '我的收藏', end: false },
];

export function NavBar() {
  const { stats } = useCollection();
  const reduce = useReducedMotion();

  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <NavLink to="/" className={styles.brand}>
            <img className={styles.brandIcon} src="icons/icon-48.png" alt="" width={34} height={34} />
            <span className={styles.brandText}>
              <strong>碧蓝档案</strong>
              <em>手办收集</em>
            </span>
          </NavLink>

          {/* 显示货币：紧跟左侧标题，全站价格的换算口径都跟着这里变 */}
          <CurrencyPicker />
        </div>

        <div className={styles.right}>
          <nav className={styles.links}>
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                {l.label}
                {l.to === '/collection' && stats.count > 0 && (
                  <motion.span
                    className={styles.badge}
                    key={stats.count}
                    initial={reduce ? undefined : { scale: 0.5, opacity: 0 }}
                    animate={reduce ? undefined : { scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  >
                    {stats.count}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
}

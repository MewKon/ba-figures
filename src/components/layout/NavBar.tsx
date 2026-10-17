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

          {/* GitHub 图标：新窗口打开仓库 */}
          <a
            className={styles.ghLink}
            href="https://github.com/MewKon/ba-figures"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub 仓库"
            title="GitHub 仓库"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>

        </div>
      </div>
    </header>
  );
}

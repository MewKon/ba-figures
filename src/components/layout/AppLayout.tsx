import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className={styles.shell}>
      <NavBar />
      {/* 面包屑：顶栏正下方，全站统一的返回入口 */}
      <Breadcrumbs />
      <main className={styles.main}>
        {/* 路由转场：淡入淡出 + 轻微位移 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className={styles.footer}>
        <div className="container">
          碧蓝档案手办收集 · <Link to="/about" className={styles.footerLink}>数据来源与关于</Link> · 图片版权归原厂商所有
        </div>
      </footer>
    </div>
  );
}

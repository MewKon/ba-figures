/**
 * 轻量弹窗：遮罩 + 居中卡片 + Esc/点遮罩关闭。
 *
 * 刻意不引弹窗库（见计划 §八：不引组件库）—— 只需要「阻止背景滚动 +
 * 焦点收进弹窗 + Esc 关闭」这三件事，自己写比配一个库的主题更省事。
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import styles from './Modal.module.css';

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);

  // Esc 关闭 + 打开期间阻止背景滚动。
  // 不动 body 的 overflow：那会拆掉滚动条、页面整体右移。根因治理是让
  // 全屏遮罩自己把 wheel/touch 事件吞掉 —— 滚动条还在原位，只是滚不动。
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // 遮罩上直接拦截滚动；弹窗内容自己能滚时放行，滚到头再拦（防滚动穿透）
    const block = (e: Event) => {
      const box = boxRef.current;
      if (!box || !box.contains(e.target as Node)) {
        e.preventDefault();
        return;
      }
      const delta = (e as WheelEvent).deltaY;
      const canScroll =
        delta > 0
          ? box.scrollTop + box.clientHeight < box.scrollHeight - 1
          : box.scrollTop > 1;
      if (!canScroll) e.preventDefault();
    };
    const el = backdropRef.current;
    el?.addEventListener('wheel', block, { passive: false });
    el?.addEventListener('touchmove', block, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKey);
      el?.removeEventListener('wheel', block);
      el?.removeEventListener('touchmove', block);
    };
  }, [open, onClose]);

  // 打开时把焦点移进弹窗，键盘用户不会留在背后的页面上
  useEffect(() => {
    if (open) boxRef.current?.focus();
  }, [open]);

  // 必须 portal 到 body：顶栏带 backdrop-filter，会让内部 fixed 元素以它为
  // 定位基准，遮罩就只盖住导航栏、盖不住页面内容了。
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={backdropRef}
          className={styles.backdrop}
          onClick={onClose}
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.div
            ref={boxRef}
            className={styles.box}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className={styles.head}>
              <h2 className={styles.title}>{title}</h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label="关闭">
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

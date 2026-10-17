/**
 * 「光环（天使の環）」—— 碧蓝档案最具识别度的图腾。
 * 一个 motif 复用三处：卡片装饰、加载态、收藏成功反馈。
 *
 * 自转/脉动用纯 CSS @keyframes（见 Halo.module.css），不用 motion：
 *   1. motion 的循环动画走 WAAPI，在无合成器的环境下 currentTime 恒为 0、
 *      一步都不推进（实测同页面 CSS keyframes 正常，WAAPI 完全静止）；
 *   2. motion 会把终值写成 inline `transform: rotate(360deg)`，覆盖掉 CSS 里的
 *      `transform: scaleY(0.42)`，光环会从椭圆退化成正圆。
 * CSS 侧改用独立的 `rotate` 属性做自转，与 `transform` 是两条独立的合成通道，
 * 既互不覆盖，也只影响这一处动画，不牵动全站其他 motion 动效。
 *
 * `animated={false}` 或系统开启「减少动态效果」→ 不加动画类，静态渲染。
 */
import { useReducedMotion } from 'motion/react';
import styles from './Halo.module.css';

type Props = {
  size?: number;
  className?: string;
  /** 是否缓慢自转+脉动（强调用） */
  animated?: boolean;
  /** 线宽 */
  thickness?: number;
};

export function Halo({ size = 44, className, animated = true, thickness = 2 }: Props) {
  const reduce = useReducedMotion();
  const spin = animated && !reduce;

  return (
    <span
      className={[styles.halo, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ['--halo-w' as string]: `${thickness}px` }}
      aria-hidden="true"
    >
      <span className={`${styles.ring} ${spin ? styles.spin : ''}`} />
      <span className={`${styles.glow} ${spin ? styles.pulse : ''}`} />
    </span>
  );
}

/**
 * 内联 SVG 图标：path 数据取自 lucide（ISC 协议），只收录用到的几个。
 * 统一 stroke 风格与 currentColor，避免各处手写 svg 碎片。
 */
import type { ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
};

export function Icon({
  name,
  size = 16,
  strokeWidth = 2.4,
}: {
  name: keyof typeof PATHS;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

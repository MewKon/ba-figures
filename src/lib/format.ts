/** 格式化工具（纯函数，无 React 依赖） */

const JPY = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

/** 21800 → '￥21,800'；缺失 → '—' */
export function formatPrice(jpy: number | undefined): string {
  return jpy == null ? '—' : JPY.format(jpy);
}

/** '2026-12' → '2026年12月'；缺失 → '—' */
export function formatRelease(ym: string | undefined): string {
  if (!ym) return '—';
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  return `${m[1]}年${Number(m[2])}月`;
}

/** 270 → '约 27cm'；缺失 → '—' */
export function formatHeight(mm: number | undefined): string {
  if (mm == null) return '—';
  if (mm < 10) return `约 ${mm}mm`;
  return `约 ${(mm / 10).toFixed(mm % 10 === 0 ? 0 : 1)}cm`;
}

/** 多个数字求和，忽略 undefined */
export function sumDefined(values: (number | undefined)[]): number {
  return values.reduce<number>((s, v) => s + (v ?? 0), 0);
}

/** 千位分隔 */
export function formatCount(n: number): string {
  return n.toLocaleString('zh-CN');
}

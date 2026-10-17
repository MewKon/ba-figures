/** 统计用纯函数：把计数转成条形图数据（按最大值归一，最长的占满） */
export function countToBars(
  items: { label: string; count: number }[],
): { label: string; count: number; pct: number }[] {
  const max = items.reduce((m, i) => Math.max(m, i.count), 0);
  if (max === 0) return [];
  return items.map((i) => ({
    label: i.label,
    count: i.count,
    // 最小 6%，避免极少量的条完全看不见
    pct: Math.max(6, Math.round((i.count / max) * 100)),
  }));
}

/**
 * 发售日历：左边横向柱形图（月度件数），右边该月详情，左右联动。
 *
 * 设计口径：
 *   · releaseDate 是 'YYYY-MM'，字典序即时间序，按月聚合即可；
 *   · 已发售的月份不进日历（那是陈列，不是预告）；
 *   · 默认选中第一个月 —— 进页面就有内容，不用先点一下；
 *   · 图未加载时卡片里显示「加载中」（FigureImage 的 loading 态）。
 */
import { useMemo, useState } from 'react';
import { figures } from '../../data/characters';
import { formatMoney, isConverted, CONVERT_NOTE } from '../../lib/currency';
import { useCurrency } from '../../hooks/useCurrency';
import { HoverHint } from '../ui/HoverHint';
import { FigureGrid } from './FigureGrid';
import styles from './ReleaseCalendar.module.css';

export function ReleaseCalendar() {
  const { code } = useCurrency();

  // 未来 12 个月的聚合（含当月）
  const months = useMemo(() => {
    const now = new Date();
    const nowYm = now.getFullYear() * 100 + (now.getMonth() + 1);
    const m = new Map<string, typeof figures>();
    for (const f of figures) {
      if (!f.releaseDate) continue;
      if (Number(f.releaseDate.replace('-', '')) < nowYm) continue;
      m.set(f.releaseDate, [...(m.get(f.releaseDate) ?? []), f]);
    }
    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 12)
      .map(([key, items]) => ({
        key,
        items,
        // 跨年时在轴上标出年份，避免「1 月」看不出是明年
        isYearStart: key.endsWith('-01'),
      }));
  }, []);

  // ★ 默认选中第一个月
  const [sel, setSel] = useState<string | null>(months[0]?.key ?? null);
  const active = months.find((m) => m.key === sel);
  const shown = active?.items ?? [];

  if (months.length === 0) return null;

  const max = Math.max(...months.map((m) => m.items.length));

  return (
    <section className={styles.wrap} aria-label="发售日历">
      <div className={styles.layout}>
        {/* 左：横向柱形图，月份从上往下按时间排 */}
        <div className={styles.chart} role="tablist" aria-label="发售月份">
          {months.map((m) => {
            const [y, mo] = m.key.split('-');
            const activeRow = sel === m.key;
            return (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={activeRow}
                className={`${styles.row} ${activeRow ? styles.on : ''}`}
                onClick={() => setSel(m.key)}
              >
                <span className={styles.label}>
                  {m.isYearStart && <em className={styles.year}>{y}年</em>}
                  {Number(mo)}月
                </span>
                <span className={styles.track}>
                  <span
                    className={styles.bar}
                    style={{ width: `${Math.max((m.items.length / max) * 100, 8)}%` }}
                    aria-hidden="true"
                  />
                </span>
                <span className={styles.count}>{m.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* 右：选中月份的详情 */}
        <div className={styles.detail}>
          <p className={styles.detailHead}>
            <strong>
              {Number(active!.key.split('-')[0])} 年 {Number(active!.key.split('-')[1])} 月
            </strong>
            <span>共 {shown.length} 件</span>
            {isConverted(code) && (
              <span className={styles.note}>
                合计 ≈ {formatMoney(shown.reduce((s, f) => s + (f.priceJpy ?? 0), 0), code)}
                <HoverHint text={CONVERT_NOTE}>
                  <span className={styles.approx}>ⓘ</span>
                </HoverHint>
              </span>
            )}
          </p>
          <FigureGrid figures={shown} />
        </div>
      </div>
    </section>
  );
}

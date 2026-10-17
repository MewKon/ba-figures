import { motion, useReducedMotion } from 'motion/react';
import { PRODUCT_TYPE_LABEL, type ProductType } from '../../types/figure';
import { countToBars } from '../../lib/stats';
import type { CollectionStats as Stats } from '../../hooks/useCollection';
import { formatCount } from '../../lib/format';
import { formatMoney, isConverted, CONVERT_NOTE } from '../../lib/currency';
import { useCurrency } from '../../hooks/useCurrency';
import { HoverHint } from '../ui/HoverHint';
import styles from './CollectionStats.module.css';

export function CollectionStats({ stats }: { stats: Stats }) {
  const reduce = useReducedMotion();
  const { code } = useCurrency();

  const mfrBars = countToBars(stats.byManufacturer.map((m) => ({ label: m.label, count: m.count })));
  const typeBars = countToBars(
    stats.byProductType.map((t) => ({
      label: PRODUCT_TYPE_LABEL[t.key as ProductType] ?? t.label,
      count: t.count,
    })),
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>已收藏</span>
          <strong className={styles.tileValue}>{formatCount(stats.count)}</strong>
          <span className={styles.tileUnit}>件</span>
        </div>
        <div className={`${styles.tile} ${styles.wide}`}>
          <span className={styles.tileLabel}>总价</span>
          <strong className={styles.tileValue}>
            {isConverted(code) && (
              <HoverHint text={CONVERT_NOTE}>
                <span className={styles.approx}>≈</span>
              </HoverHint>
            )}
            {formatMoney(stats.totalJpy, code)}
          </strong>
          {stats.pricedCount < stats.count && (
            <span className={styles.tileUnit}>
              （{stats.count - stats.pricedCount} 件未公布定价，不计入）
            </span>
          )}
        </div>
      </div>

      {(mfrBars.length > 0 || typeBars.length > 0) && (
        <div className={styles.charts}>
          {mfrBars.length > 0 && (
            <BarChart title="按厂商" bars={mfrBars} reduce={!!reduce} />
          )}
          {typeBars.length > 0 && (
            <BarChart title="按商品类型" bars={typeBars} reduce={!!reduce} />
          )}
        </div>
      )}
    </div>
  );
}

function BarChart({
  title,
  bars,
  reduce,
}: {
  title: string;
  bars: { label: string; count: number; pct: number }[];
  reduce: boolean;
}) {
  return (
    <div className={styles.chart}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ul className={styles.bars}>
        {bars.map((b) => (
          <li key={b.label} className={styles.barRow}>
            <span className={`${styles.barLabel} ellipsis`}>{b.label}</span>
            <span className={styles.barTrack}>
              <motion.span
                className={styles.barFill}
                initial={reduce ? undefined : { width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className={styles.barCount}>{b.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

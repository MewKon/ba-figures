import { useMemo } from 'react';
import { figures } from '../data/characters';
import { useCollection } from '../hooks/useCollection';
import { FigureGrid } from '../components/figure/FigureGrid';
import { CollectionStats } from '../components/collection/CollectionStats';
import { EmptyState } from '../components/ui/EmptyState';
import styles from './CollectionPage.module.css';

export function CollectionPage() {
  const { items, stats } = useCollection();

  // 收藏条目：已拥有的排前面，同类按发售时间倒序
  const shown = useMemo(() => {
    const marked = figures.filter((f) => items[f.id]);
    return [...marked].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  }, [items]);

  return (
    <div className="container">
      <header className="head" style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.02em' }}>我的收藏</h1>
        <p style={{ marginTop: 'var(--sp-2)', fontSize: 14, color: 'var(--ink-2)' }}>
          标记会保存在本机浏览器，不会上传。
        </p>
      </header>

      {stats.count === 0 ? (
        <EmptyState
          title="还没有收藏任何手办"
          hint="在画廊里点卡片右下角的 ★（收藏），就能把它们收进这里。"
        />
      ) : (
        <div className={styles.layout}>
          <aside className={styles.side}>
            <CollectionStats stats={stats} />
          </aside>

          <div className={styles.list}>
            <FigureGrid figures={shown} />
          </div>
        </div>
      )}
    </div>
  );
}

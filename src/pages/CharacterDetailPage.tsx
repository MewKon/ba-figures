import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { findCharacter, typesOf } from '../data/characters';
import { PRODUCT_TYPE_LABEL, type ProductType } from '../types/figure';
import { applySort, type SortKey } from '../lib/filters';
import { FigureGrid } from '../components/figure/FigureGrid';
import { SortSelect } from '../components/filters/SortSelect';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import styles from './CharacterDetailPage.module.css';

/** 某一位角色名下的全部手办 */
export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const group = findCharacter(id);
  const [type, setType] = useState<ProductType | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('default');

  const types = useMemo(() => (group ? typesOf(group) : []), [group]);
  const shown = useMemo(
    () =>
      group
        ? applySort(
            type === 'all' ? group.items : group.items.filter((f) => f.productType === type),
            sort,
          )
        : [],
    [group, type, sort],
  );

  if (!group) {
    return (
      <div className="container">
        <EmptyState title="未找到这位角色" hint="链接可能已失效。" />
      </div>
    );
  }

  return (
    <div className="container" style={{ ['--c' as string]: group.themeColor }}>
      <header className={styles.head}>
        <span className={styles.swatch} aria-hidden="true" />
        <div className={styles.text}>
          <h1 className={styles.name}>{group.nameZh}</h1>
          <p className={styles.ja}>{group.nameJa}</p>
          <div className={styles.meta}>
            {group.school && <span>{group.school}</span>}
            <span className={styles.dot}>·</span>
            <span>{group.series}</span>
          </div>
        </div>
        <div className={styles.right}>
          <strong className={styles.big}>{group.count}</strong>
          <span>
            件手办
            {group.rereleaseCount > 0 && (
              <span className={styles.reNote}>（{group.rereleaseCount} 件有再版）</span>
            )}
          </span>
        </div>
      </header>

      {types.length > 1 && (
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${type === 'all' ? styles.on : ''}`}
            onClick={() => setType('all')}
          >
            全部 <span className={styles.n}>{group.count}</span>
          </button>
          {types.map((t) => {
            const n = group.items.filter((f) => f.productType === t).length;
            return (
              <button
                key={t}
                type="button"
                className={`${styles.tab} ${type === t ? styles.on : ''}`}
                onClick={() => setType(t)}
              >
                {PRODUCT_TYPE_LABEL[t]} <span className={styles.n}>{n}</span>
              </button>
            );
          })}
          <div className={styles.sortSlot}>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>
      )}

      <div className={styles.badges}>
        {group.manufacturers.map((m) => (
          <Badge key={m} tone="muted">
            {m}
          </Badge>
        ))}
      </div>

      {group.count === 0 ? (
        <EmptyState
          title="这位角色还没有手办"
          hint="已收录在这份角色表里，等厂商公布后会补上。"
        />
      ) : (
        <>
          {/* 单一类型时上面的 tabs 不渲染，排序器单独给一行 */}
          {types.length <= 1 && (
            <div className={`${styles.tabs} ${styles.sortOnly}`}>
              <SortSelect value={sort} onChange={setSort} />
            </div>
          )}
          <FigureGrid figures={shown} />
        </>
      )}
    </div>
  );
}

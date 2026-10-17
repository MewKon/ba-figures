/**
 * 收藏清单状态：Context + localStorage 持久化。
 *
 * 三个必须做对的点（见计划 §五）：
 *  1. Context 包在最外层 —— 否则导航栏与详情页各持一份状态，计数不同步
 *  2. 惰性初始化 useState(readStored) —— 只读一次，首帧即带正确数据
 *  3. try/catch 包住读与写两侧 —— 坏数据/无痕模式都不能让页面白屏
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Figure } from '../types/figure';
import { sumDefined } from '../lib/format';

type CollectionMap = Record<string, true>;

interface StoredShape {
  v: 2;
  items: CollectionMap;
}

const KEY = 'ba-figures:collection:v2';

/* ------------------------------------------------------------------ */
/* 容错读写                                                            */
/* ------------------------------------------------------------------ */

function readStored(): CollectionMap {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    const items = (parsed as StoredShape | null)?.items;
    if (!items || typeof items !== 'object') return {};
    // 只留真值条目，手改过的坏值活不下来
    return Object.fromEntries(
      Object.entries(items).filter(([, v]) => v === true),
    ) as CollectionMap;
  } catch {
    return {}; // JSON 语法错、存储被禁 → 空清单，不崩
  }
}

function writeStored(items: CollectionMap): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: 2, items } satisfies StoredShape));
  } catch {
    /* 无痕模式 / 配额满：静默降级为本次会话内存态 */
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface CollectionValue {
  items: CollectionMap;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  stats: CollectionStats;
}

export interface CollectionStats {
  count: number;
  totalJpy: number;
  /** 有定价的收藏条目数（差额即未公布定价的件数） */
  pricedCount: number;
  byManufacturer: { label: string; count: number }[];
  byProductType: { key: string; label: string; count: number }[];
}

const Ctx = createContext<CollectionValue | null>(null);

export function CollectionProvider({
  children,
  figures,
}: {
  children: ReactNode;
  figures: Figure[];
}) {
  // ★ 惰性初始化：传函数引用而非调用结果
  const [items, setItems] = useState<CollectionMap>(readStored);

  const toggle = useCallback((id: string) => {
    setItems((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      writeStored(next); // ★ 写透，不用 useEffect 同步
      return next;
    });
  }, []);

  const has = useCallback((id: string) => !!items[id], [items]);

  // 统计用 useMemo 派生，不进 state
  const stats = useMemo<CollectionStats>(() => {
    const marked = figures.filter((f) => items[f.id]);

    const byMfr = new Map<string, number>();
    for (const f of marked) byMfr.set(f.manufacturer, (byMfr.get(f.manufacturer) ?? 0) + 1);

    const byType = new Map<string, number>();
    for (const f of marked) byType.set(f.productType, (byType.get(f.productType) ?? 0) + 1);

    return {
      count: marked.length,
      totalJpy: sumDefined(marked.map((f) => f.priceJpy)),
      pricedCount: marked.filter((f) => f.priceJpy != null).length,
      byManufacturer: [...byMfr.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count),
      byProductType: [...byType.entries()]
        .map(([key, count]) => ({ key, label: key, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [items, figures]);

  const value = useMemo<CollectionValue>(
    () => ({ items, toggle, has, stats }),
    [items, toggle, has, stats],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCollection(): CollectionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCollection 必须在 <CollectionProvider> 内使用');
  return v;
}

/**
 * 筛选与排序：纯函数。
 *
 * 组合语义 —— 维度之间 AND，维度内部 OR（标准分面搜索）。
 */
import type {
  Figure,
  Manufacturer,
  ProductType,
  Scale,
} from '../types/figure';

export type { SortKey } from '../types/figure';
import type { SortKey } from '../types/figure';
import { normalize, buildSearchIndex } from './search';

export type CollectionFilter = 'all' | 'owned' | 'none';

export interface Filters {
  q: string;
  manufacturers: Manufacturer[];
  productTypes: ProductType[];
  scales: Scale[];
  series: string[];
  schools: string[];
  collection: CollectionFilter;
}

export type CollectionMap = Record<string, unknown>;

export const EMPTY_FILTERS: Filters = {
  q: '',
  manufacturers: [],
  productTypes: [],
  scales: [],
  series: [],
  schools: [],
  collection: 'all',
};

/* ---------------- 筛选 ---------------- */

export function applyFilters(
  figures: Figure[],
  filters: Filters,
  collection: CollectionMap,
): Figure[] {
  const index = buildSearchIndex(figures);
  const q = normalize(filters.q);
  const f = filters;

  return figures.filter((fig) => {
    if (q && !index.get(fig.id)?.includes(q)) return false;

    // 维度内 OR，维度间 AND
    if (f.manufacturers.length && !f.manufacturers.includes(fig.manufacturer)) return false;
    if (f.productTypes.length && !f.productTypes.includes(fig.productType)) return false;
    // scale 可能为 undefined（景品常无比例）—— 必须显式判空，
    // 否则 undefined 会被错误地"包含"进任何比例筛选
    if (f.scales.length && !(fig.scale && f.scales.includes(fig.scale))) return false;
    if (f.series.length && !f.series.includes(fig.series)) return false;
    if (f.schools.length && !(fig.school && f.schools.includes(fig.school))) return false;

    const st = collection[fig.id];
    if (f.collection === 'owned' && !st) return false;
    if (f.collection === 'none' && st) return false;

    return true;
  });
}

/* ---------------- 排序 ---------------- */

/** 排序标准（不含方向）；方向由单独的开关控制 */
export type SortField = 'release' | 'price' | 'name' | 'height';
/** 排序方向：asc / desc */
export type SortDir = 'asc' | 'desc';

/** 排序标准 → 该标准默认方向（点标准即用默认方向，可再手动翻转） */
export const SORT_FIELD_DEFAULT_DIR: Record<SortField, SortDir> = {
  release: 'desc', // 新→旧
  price: 'asc', // 低→高
  name: 'asc', // 拼音 A→Z
  height: 'desc', // 大→小
};

export const SORT_FIELDS: { key: SortField; label: string }[] = [
  { key: 'release', label: '发售时间' },
  { key: 'price', label: '价格' },
  { key: 'name', label: '角色名（拼音）' },
  { key: 'height', label: '尺寸' },
];

/** 标准 + 方向 → 组合出旧 SortKey（沿用 applySort 的实现） */
export function sortKeyOf(field: SortField, dir: SortDir): SortKey {
  switch (field) {
    case 'release': return dir === 'desc' ? 'release-desc' : 'release-asc';
    case 'price': return dir === 'asc' ? 'price-asc' : 'price-desc';
    case 'name': return 'name-asc'; // 拼音无反向需求
    case 'height': return dir === 'desc' ? 'height-desc' : 'height-asc';
  }
}

// height-asc 旧类型里没有，补上（排序函数同步支持）
export function applySortWithDir(figures: Figure[], field: SortField, dir: SortDir): Figure[] {
  if (field === 'height' && dir === 'asc') {
    return [...figures].sort(
      (a, b) => num(a.heightMm, Infinity) - num(b.heightMm, Infinity) || a.id.localeCompare(b.id),
    );
  }
  return applySort(figures, sortKeyOf(field, dir));
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '推荐顺序' },
  { key: 'release-desc', label: '发售时间（新→旧）' },
  { key: 'release-asc', label: '发售时间（旧→新）' },
  { key: 'price-asc', label: '价格（低→高）' },
  { key: 'price-desc', label: '价格（高→低）' },
  { key: 'name-asc', label: '角色名（拼音）' },
  { key: 'height-desc', label: '尺寸（大→小）' },
];

/** 缺失值统一沉底，避免 NaN 打乱整个数组 */
function num(v: number | undefined, fallback: number): number {
  return v ?? fallback;
}

export function applySort(figures: Figure[], key: SortKey): Figure[] {
  const arr = [...figures];
  const tie = (a: Figure, b: Figure) => a.id.localeCompare(b.id);

  switch (key) {
    case 'release-desc':
      // 'YYYY-MM' 字典序 == 时间序，无需构造 Date
      arr.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || tie(a, b));
      break;
    case 'release-asc':
      arr.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || tie(a, b));
      break;
    case 'price-asc':
      arr.sort((a, b) => num(a.priceJpy, Infinity) - num(b.priceJpy, Infinity) || tie(a, b));
      break;
    case 'price-desc':
      arr.sort((a, b) => num(b.priceJpy, -Infinity) - num(a.priceJpy, -Infinity) || tie(a, b));
      break;
    case 'height-desc':
      arr.sort((a, b) => num(b.heightMm, -Infinity) - num(a.heightMm, -Infinity) || tie(a, b));
      break;
    case 'height-asc':
      arr.sort((a, b) => num(a.heightMm, Infinity) - num(b.heightMm, Infinity) || tie(a, b));
      break;
    case 'name-asc':
      // 'zh-Hans-CN' 让 localeCompare 按拼音排序 —— 免费的拼音序
      arr.sort(
        (a, b) => a.characterName.localeCompare(b.characterName, 'zh-Hans-CN') || tie(a, b),
      );
      break;
    case 'default':
      // 按发售时间倒序作为默认
      arr.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || tie(a, b));
      break;
  }
  return arr;
}

/* ---------------- 分面（筛选选项 + 计数） ---------------- */

export interface Facet {
  value: string;
  label: string;
  count: number;
}

function facetOf(figures: Figure[], pick: (f: Figure) => string | undefined): Facet[] {
  const m = new Map<string, number>();
  for (const f of figures) {
    const v = pick(f);
    if (!v) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export interface Facets {
  manufacturers: Facet[];
  productTypes: Facet[];
  scales: Facet[];
  series: Facet[];
  schools: Facet[];
}

/** 从数据派生所有筛选选项 —— 不手写第二份清单，避免不同步 */
export function buildFacets(figures: Figure[]): Facets {
  return {
    manufacturers: facetOf(figures, (f) => f.manufacturer),
    productTypes: facetOf(figures, (f) => f.productType),
    scales: facetOf(figures, (f) => f.scale),
    series: facetOf(figures, (f) => f.series),
    schools: facetOf(figures, (f) => f.school),
  };
}

/** 是否存在任何生效中的筛选条件 */
export function hasActiveFilters(f: Filters): boolean {
  return (
    f.q.trim() !== '' ||
    f.manufacturers.length > 0 ||
    f.productTypes.length > 0 ||
    f.scales.length > 0 ||
    f.series.length > 0 ||
    f.schools.length > 0 ||
    f.collection !== 'all'
  );
}

/** 数组字段的切换（用于分面多选） */
export function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

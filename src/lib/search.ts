/**
 * 搜索：全角归一化 + 预建 haystack。
 * 纯函数，无 React 依赖。
 */
import type { Figure } from '../types/figure';
import { PRODUCT_TYPE_LABEL } from '../types/figure';

/** 全角→半角（NFKC）、小写、去空白。'ＧＳＣ' → 'gsc' */
export function normalize(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
}

/**
 * 构建单条手办的可搜索文本。
 * 覆盖：中文名 / 日文名 / 罗马字 / 别名 / 社团 / 学校 / 厂商 / 类型 / 比例 / 原型师 / JAN / 标签
 */
export function buildHaystack(f: Figure): string {
  return normalize(
    [
      f.characterName,
      f.characterNameJa,
      f.characterNameEn ?? '',
      ...(f.aliases ?? []),
      f.series,
      f.school ?? '',
      f.manufacturer,
      PRODUCT_TYPE_LABEL[f.productType],
      f.productType,
      f.scale ?? '',
      f.jan ?? '',
      f.hljCode ?? '',
      ...(f.tags ?? []),
    ].join(' '),
  );
}

/** 预建索引：id → haystack。数据静态，构建一次即可。 */
export function buildSearchIndex(figures: Figure[]): Map<string, string> {
  return new Map(figures.map((f) => [f.id, buildHaystack(f)]));
}

/** 单条匹配（query 需已 normalize） */
export function matchesIndex(index: Map<string, string>, id: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return index.get(id)?.includes(normalizedQuery) ?? false;
}

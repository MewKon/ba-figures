/**
 * 按角色聚合 —— 主页以角色为入口，点击后进该角色的手办列表。
 * 数据静态，模块加载时算一次。
 *
 * 角色全集来自 roster.json（权威角色表），**含尚无手办的角色**（count 为 0），
 * 所以主页能列出完整阵容而非只有「已出过手办」的那批。
 */
import raw from './figures.json';
import rawRoster from './roster.json';
import type { Figure, Manufacturer, ProductType, RosterEntry } from '../types/figure';

export const figures = raw as Figure[];
export const roster = rawRoster as RosterEntry[];

export interface CharacterGroup {
  /** 罗马字稳定标识，路由用 */
  id: string;
  nameZh: string;
  nameJa: string;
  nameEn: string;
  /** SchaleDB 学生编号；NPC 无此编号（立绘已统一按 id 命名，不依赖此字段） */
  schaleId?: number;
  school?: string;
  series: string;
  themeColor: string;
  aliases: string[];
  count: number;
  /** 该角色名下发生过再版的手办数（卡片上提示「有再版」用） */
  rereleaseCount: number;
  /** 该角色的厂商（0 件时为空数组） */
  manufacturers: Manufacturer[];
  /** 发售时间倒序 */
  items: Figure[];
}

/** 一个角色下所有类型（去重、按数量降序） */
export function typesOf(g: CharacterGroup): ProductType[] {
  const m = new Map<ProductType, number>();
  for (const f of g.items) m.set(f.productType, (m.get(f.productType) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

export const characters: CharacterGroup[] = (() => {
  const byId = new Map<string, Figure[]>();
  for (const f of figures) {
    const list = byId.get(f.characterId);
    if (list) list.push(f);
    else byId.set(f.characterId, [f]);
  }

  const known = new Set(roster.map((r) => r.id));

  return roster
    .map((r) => {
      const items = [...(byId.get(r.id) ?? [])].sort(
        (a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id),
      );
      return {
        id: r.id,
        nameZh: r.nameZh,
        nameJa: r.nameJa,
        nameEn: r.nameEn,
        schaleId: r.schaleId,
        school: r.school,
        series: r.series,
        themeColor: r.themeColor,
        aliases: r.aliases,
        count: items.length,
        rereleaseCount: items.filter((f) => f.rereleases?.length).length,
        manufacturers: [...new Set(items.map((f) => f.manufacturer))],
        items,
      };
    })
    // 兜底：roster 里没有、但手办数据里出现的角色（权威表新角色滞后时不丢数据）
    .concat(
      [...byId.entries()]
        .filter(([id]) => !known.has(id))
        .map(([id, items]) => {
          const sorted = [...items].sort(
            (a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id.localeCompare(b.id),
          );
          const head = sorted[0];
          return {
            id,
            nameZh: head.characterName,
            nameJa: head.characterNameJa,
            nameEn: head.characterNameEn ?? id,
            schaleId: head.schaleId,
            school: head.school,
            series: head.series,
            themeColor: head.themeColor,
            aliases: head.aliases ?? [],
            count: sorted.length,
            rereleaseCount: sorted.filter((f) => f.rereleases?.length).length,
            manufacturers: [...new Set(sorted.map((f) => f.manufacturer))],
            items: sorted,
          };
        }),
    )
    // 有手办的排前面，其次按中文名拼音（0 件的自然沉到各组末尾/末尾）
    .sort((a, b) => b.count - a.count || a.nameZh.localeCompare(b.nameZh, 'zh-Hans-CN'));
})();

export const TOTAL_FIGURES = figures.length;
export const TOTAL_CHARACTERS = characters.length;

/**
 * 已发售的手办数。
 * releaseDate 是 'YYYY-MM'，字典序即时间序，故拼成 YYYYMM 直接比大小；
 * 当月算已发售（发售日一般标在月末，宁可算进来也不提前算未发售）。
 */
export const TOTAL_RELEASED = figures.filter((f) => {
  const d = new Date();
  const nowYm = d.getFullYear() * 100 + (d.getMonth() + 1);
  return f.releaseDate && Number(f.releaseDate.replace('-', '')) <= nowYm;
}).length;

const byId = new Map(characters.map((c) => [c.id, c]));
export function findCharacter(id: string | undefined): CharacterGroup | undefined {
  return id ? byId.get(id) : undefined;
}

export const findFigure = (id: string | undefined) =>
  id ? figures.find((f) => f.id === id) : undefined;

/** 学校列表：取自全量角色表，保证有角色但暂无双图的学校也能筛到 */
export const schools = [...new Set(roster.map((r) => r.school).filter(Boolean))].sort((a, b) =>
  String(a).localeCompare(String(b), 'zh-Hans-CN'),
) as string[];

export const seriesList = [...new Set(roster.map((r) => r.series))].sort((a, b) =>
  a.localeCompare(b, 'zh-Hans-CN'),
);

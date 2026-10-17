/**
 * 手办数据模型 —— 前端与采集脚本共用。
 */

/**
 * 厂商：HLJ 上有 40+ 家（GSC、Max Factory、ALTER、Kotobukiya、CARAVAN…），
 * 用封闭枚举会把真实厂商名全塞进「其他」——所以这里是开放字符串。
 * 展示名映射见 MANUFACTURER_LABEL（未知厂商原样显示）。
 */
export type Manufacturer = string;

export type ProductType =
  | 'scale' // 比例手办
  | 'nendoroid' // 黏土人
  | 'figma' // figma 可动
  | 'popup' // POP UP PARADE
  | 'prize' // 景品
  | 'model' // 拼装模型（PLAMAX / MODEROID / PLAMATEA）
  | 'other';

export type Scale = '1/4' | '1/6' | '1/7' | '1/8' | 'non-scale';

export type CollectionStatus = 'owned';

export type SortKey =
  | 'default'
  | 'release-desc'
  | 'release-asc'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'height-desc'
  | 'height-asc';

/**
 * 一次发售记录。同一副模具可能多次开卖（初版 / 再版），
 * 每次都有各自的发售日、定价与 JAN —— 详情页按这些记录分标签页。
 */
export interface FigureRelease {
  /** 'YYYY-MM'；字典序即时间序 */
  date: string;
  priceJpy?: number;
  jan?: string;
  hljCode?: string;
  officialUrl?: string;
}

export interface Figure {
  /** slug：路由参数 + public/images/<id>.jpg 约定 */
  id: string;
  /** 角色稳定标识（罗马字，如 'mika'）—— 主页按此分组 */
  characterId: string;
  /** SchaleDB 学生编号；NPC 无此编号（立绘统一按角色 id 命名，见 CharacterPortrait） */
  schaleId?: number;
  /** HLJ 商品编码（sku），溯源用 */
  hljCode?: string;
  /** 中文名（来自权威角色表） */
  characterName: string;
  /** 日文名 */
  characterNameJa: string;
  /** 罗马字 / 英文名 */
  characterNameEn?: string;
  /** 昵称 / 简称 / 拼音 —— 覆盖拼音搜索 */
  aliases?: string[];
  /** 所属社团/小队 */
  series: string;
  /** 学校 */
  school?: string;
  manufacturer: Manufacturer;
  productType: ProductType;
  /** 景品常无比例 → 可选 */
  scale?: Scale;
  heightMm?: number;
  /** 'YYYY-MM'；字典序即时间序。再版已合并 → 这里是**首次发售** */
  releaseDate: string;
  /** 常未公布 → 可选。再版已合并 → 这里是**初版定价** */
  priceJpy?: number;
  /** JAN/EAN 条码（初版） */
  jan?: string;
  officialUrl?: string;
  /** 缺省 → 渲染渐变占位卡 */
  imageUrl?: string;
  /**
   * 全部商品图（含 imageUrl 那张首图），按官方 gallery 顺序。
   * 详情页画廊用它做左右切换；只有一张时为 undefined。
   * 文件名约定：<slug>.jpg（首图）、<slug>-<N>.jpg（第 N 张，N≥1）。
   */
  imageUrls?: string[];
  /** ★ 必填：角色主题色，驱动占位渐变与卡片强调色 */
  themeColor: string;
  tags?: string[];
  notes?: string;
  /**
   * 再版记录（**不含初版**），按日期升序。
   * scripts/generate.ts 把 slug 里的 rerelease/reissue 条目合并进来，
   * 没有再版时为 undefined。
   */
  rereleases?: FigureRelease[];
}

/** 完整发售历史：初版 + 各次再版，按日期升序（详情页标签页用） */
export function releaseHistory(f: Figure): FigureRelease[] {
  const initial: FigureRelease = {
    date: f.releaseDate,
    priceJpy: f.priceJpy,
    jan: f.jan,
    hljCode: f.hljCode,
    officialUrl: f.officialUrl,
  };
  return [initial, ...(f.rereleases ?? [])];
}

/**
 * 角色元数据（由 scripts/fetch-characters.ts 从 SchaleDB 生成，
 * 存于 data/raw/schaledb/characters.json）。键为小写罗马字。
 */
export interface CharacterMeta {
  /** SchaleDB 学生编号（立绘图文件名） */
  schaleId?: number;
  nameZh: string;
  nameJa: string;
  nameEn: string;
  school?: string;
  /** 社团/小队（中文） */
  series: string;
  aliases?: string[];
}

export type CharacterMetaMap = Record<string, CharacterMeta>;

/**
 * 全量角色表条目（scripts/generate.ts 产出 src/data/roster.json）。
 * 含**尚无手办**的角色 —— 主页把它们一并列出，计数为 0。
 * 同一人物的服装变体已按中文名去重。
 */
export interface RosterEntry {
  /** 与 Figure.characterId 同域，可 join */
  id: string;
  schaleId?: number;
  nameZh: string;
  nameJa: string;
  nameEn: string;
  school?: string;
  series: string;
  aliases: string[];
  themeColor: string;
}

/* ---------------- 展示标签 ---------------- */

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  scale: '比例手办',
  nendoroid: '黏土人',
  figma: 'figma',
  popup: 'POP UP PARADE',
  prize: '景品',
  model: '拼装模型',
  other: '其他',
};

/** 常见厂商的展示名；未收录的原样显示 */
export const MANUFACTURER_LABEL: Record<string, string> = {
  GSC: 'Good Smile Company',
  'Max Factory': 'Max Factory',
  ALTER: 'ALTER',
  Kotobukiya: '寿屋',
  FuRyu: 'FuRyu',
  SEGA: 'SEGA',
  FREEing: 'FREEing',
  Kadokawa: 'KADOKAWA',
  GoodSmileArts: 'Good Smile Arts',
  PhatCompany: 'Phat! Company',
  Solarain: 'Solarain',
  MegaHouse: 'MegaHouse',
};

export const manufacturerLabel = (m: string): string => MANUFACTURER_LABEL[m] ?? m;

export const COLLECTION_LABEL: Record<CollectionStatus, string> = {
  owned: '收藏',
};

/**
 * 商品标签元数据：展示名 + 徽章配色（CSS 变量名）。
 * 现有数据全部来自 HLJ 正版渠道 → 都带 official；将来接入
 * 同人 / GK 等非官方来源时补对应条目即可，未知标签原样显示。
 */
export const TAG_META: Record<string, { label: string; tone: 'blue' | 'green' | 'muted' }> = {
  官方: { label: '官方', tone: 'green' },
};

export const tagMeta = (t: string) => TAG_META[t] ?? { label: t, tone: 'muted' as const };

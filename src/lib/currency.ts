/**
 * 货币换算 —— 数据里的价格一律是**日元定价**（HLJ 商品页原价），
 * 这里按固定汇率换算成其他货币，只用于展示。
 *
 * ⚠️ 汇率是写死的指示性数值，不是实时行情：
 *   · 本站在浏览器里不发任何外部请求（避免 CORS / 断网 / 限流等失败面），
 *     所以拿不到实时汇率；
 *   · 换算结果仅供比价参考，**不含关税、国际运费、代购手续费等**，
 *     实际到手价以商家结算页为准。
 * 需要更新时：改 RATES 里的数值，并把 RATES_AS_OF 改成当天日期。
 */

export type CurrencyCode = 'JPY' | 'CNY' | 'KRW' | 'USD';

export interface CurrencyDef {
  code: CurrencyCode;
  /** 展示名（中文） */
  label: string;
  /**
   * 符号自己写死，不用 Intl 推断：中文环境里 ¥ 同时是日元和人民币，
   * 交给 Intl(zh) 两者都渲染成 ¥，用户没法区分。人民币特意写成 CN¥。
   */
  symbol: string;
  /** 控制千分位与小数点的书写习惯 */
  locale: string;
  /** 1 日元 = rate 本货币 */
  rate: number;
  /** 小数位：日元/韩元没有分位，人民币/美元保留两位 */
  digits: number;
}

/** 1 日元等于多少目标货币 —— 指示性汇率，需人工维护 */
const RATES = {
  JPY: 1,
  CNY: 0.0485,
  KRW: 9.2,
  USD: 0.0067,
} as const;

export const RATES_AS_OF = '2026-10-16';

export const CURRENCIES: CurrencyDef[] = [
  { code: 'JPY', label: '日元', symbol: '¥', locale: 'ja-JP', rate: RATES.JPY, digits: 0 },
  { code: 'CNY', label: '人民币', symbol: 'CN¥', locale: 'zh-CN', rate: RATES.CNY, digits: 2 },
  { code: 'KRW', label: '韩元', symbol: '₩', locale: 'ko-KR', rate: RATES.KRW, digits: 0 },
  { code: 'USD', label: '美元', symbol: 'US$', locale: 'en-US', rate: RATES.USD, digits: 2 },
];

export const DEFAULT_CURRENCY: CurrencyCode = 'JPY';

export const currencyDef = (code: CurrencyCode): CurrencyDef =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

/** 非日元即为「换算价」，界面用 ≈ 前缀提示这是折算值而非商家标价 */
export const isConverted = (code: CurrencyCode): boolean => code !== 'JPY';

/** 换算价的口径说明：hover tooltip 用，避免正文各处重复堆字 */
export const CONVERT_NOTE = '按日元原价换算，不含关税、国际运费、代购手续费等；实际到手价以商家结算页为准。';

/**
 * 把日元原价换算并按当前货币格式化。
 * 金额缺失 → '—'（保持与原 formatPrice 一致的缺省行为）。
 */
export function formatMoney(jpy: number | undefined, code: CurrencyCode): string {
  if (jpy == null) return '—';
  const c = currencyDef(code);
  const value = jpy * c.rate;
  const num = new Intl.NumberFormat(c.locale, {
    minimumFractionDigits: c.digits,
    maximumFractionDigits: c.digits,
  }).format(value);
  return `${c.symbol}${num}`;
}

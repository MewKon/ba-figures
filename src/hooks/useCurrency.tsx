/**
 * 货币偏好：Context + localStorage，和收藏清单一样的容错写法。
 *
 * 为什么用 Context 而不是把状态放在某个页面里：
 *   价格散落在角色卡、手办详情、收藏统计三处，货币一变要全站同步；
 *   各自持有状态就会出现「卡片改了、统计没改」的割裂。
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '../lib/currency';

const KEY = 'ba-figures:currency:v1';

const CODES = CURRENCIES.map((c) => c.code);

function readStored(): CurrencyCode {
  try {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;
    const v = window.localStorage.getItem(KEY);
    // 白名单校验：旧版本残留或手改过的值都不能让界面拿到不存在的货币
    return v && (CODES as string[]).includes(v) ? (v as CurrencyCode) : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY; // 无痕模式 / 存储被禁
  }
}

function writeStored(code: CurrencyCode): void {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    /* 静默降级为本次会话内存态 */
  }
}

interface CurrencyValue {
  code: CurrencyCode;
  setCode: (c: CurrencyCode) => void;
  /** 弹窗开关：放在 Context 里，任意页面都能唤起 */
  picking: boolean;
  openPicker: () => void;
  closePicker: () => void;
}

const Ctx = createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<CurrencyCode>(readStored);
  const [picking, setPicking] = useState(false);

  const setCode = useCallback((c: CurrencyCode) => {
    writeStored(c); // 写透，不用 useEffect 同步
    setCodeState(c);
  }, []);

  const openPicker = useCallback(() => setPicking(true), []);
  const closePicker = useCallback(() => setPicking(false), []);

  const value = useMemo<CurrencyValue>(
    () => ({ code, setCode, picking, openPicker, closePicker }),
    [code, setCode, picking, openPicker, closePicker],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency(): CurrencyValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCurrency 必须在 <CurrencyProvider> 内使用');
  return v;
}

import { useEffect, useState } from 'react';

/**
 * 全站访问量（PV）。
 * 用 Abacus（免费、无需注册的计数 API）：/hit 自增并返回当前值，CORS 开放。
 * 本地开发用独立命名空间，不会污染线上的真实数字。
 */
const PROD_HOST = 'ba-figures.saveslot.xyz';
const NAMESPACE = 'ba-figures.saveslot.xyz';
const DEV_NAMESPACE = 'ba-figures-dev';
const KEY = 'visits';

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const ns = window.location.hostname === PROD_HOST ? NAMESPACE : DEV_NAMESPACE;
    const ctrl = new AbortController();

    fetch(`https://abacus.jasoncameron.dev/hit/${ns}/${KEY}`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { value?: number }) => {
        if (typeof d.value === 'number') setCount(d.value);
      })
      // 服务不可用时整段隐藏，不影响页脚
      .catch(() => {});

    return () => ctrl.abort();
  }, []);

  if (count === null) return null;
  return <>{` · 本站访问 ${count.toLocaleString('zh-CN')} 次`}</>;
}

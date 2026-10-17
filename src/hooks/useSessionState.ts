/** 会话内留存的 useState：值变化即写入 sessionStorage，重挂载 / 刷新后恢复 */
import { useEffect, useState } from 'react';

export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* 隐私模式等写入失败时静默降级为普通 state */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

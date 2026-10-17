/**
 * 排序选择器：原生 <select> 套皮 —— 比自己写下拉菜单少一半代码，
 * 且移动端直接弹系统选择器，可访问性白拿。
 */
import { SORT_OPTIONS, type SortKey } from '../../lib/filters';
import styles from './SortSelect.module.css';

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (k: SortKey) => void;
}) {
  return (
    <label className={styles.wrap}>
      <span className={styles.label}>排序</span>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        aria-label="排序方式"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className={styles.chev} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

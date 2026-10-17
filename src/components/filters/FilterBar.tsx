/**
 * 主页筛选条：一排下拉框收纳「视图 / 分组 / 排序」。
 * 第一个下拉决定看什么；分组与排序各给两套选项 —— 跟随视图切换。
 * 每个 select 复用排序器的胶囊样式。
 */
import { schools } from '../../data/characters';
import {
  SORT_FIELDS, SORT_FIELD_DEFAULT_DIR,
  type SortField, type SortDir,
} from '../../lib/filters';
import styles from './SortSelect.module.css';

/** 视图：角色列表 / 手办列表 */
export type View = 'characters' | 'figures';
/** 角色列表的分组 */
export type CharGroup = 'none' | 'school' | 'series';
/** 手办列表的分组 */
export type FigGroup = 'none' | 'character' | 'manufacturer' | 'type';
/** 排序标准：手办=发售/价格/名称/尺寸，角色=手办数/名称 */
export type SortCriterion = SortField | 'count';

const CHAR_SORT_OPTIONS: { key: SortCriterion; label: string }[] = [
  { key: 'count', label: '手办数' },
  { key: 'name', label: '名称（拼音）' },
];

const Field = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) => (
  <label className={styles.wrap}>
    <span className={styles.label}>{label}</span>
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      {children}
    </select>
    <svg className={styles.chev} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </label>
);

/** 排序 = 标准下拉 + 方向按钮。切标准时用该标准的默认方向；按钮再手动翻转 */
function SortField({
  label,
  value,
  dir,
  options,
  onCriterion,
  onDir,
}: {
  label: string;
  value: SortCriterion;
  dir: SortDir;
  options: { key: SortCriterion; label: string }[];
  onCriterion: (c: SortCriterion) => void;
  onDir: (d: SortDir) => void;
}) {
  return (
    <span className={styles.group}>
      <Field
        label={label}
        value={value}
        onChange={(v) => {
          const c = v as SortCriterion;
          onCriterion(c);
          onDir(SORT_FIELD_DEFAULT_DIR[c as SortField] ?? 'desc');
        }}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </Field>
      {/* 方向按钮：双箭头图标，当前方向的那一半高亮（antd / MUI 表头排序的常见画法） */}
      <button
        type="button"
        className={styles.dirBtn}
        onClick={() => onDir(dir === 'asc' ? 'desc' : 'asc')}
        aria-label={dir === 'asc' ? '正序，点击切换为倒序' : '倒序，点击切换为正序'}
        title={dir === 'asc' ? '正序（点击切换倒序）' : '倒序（点击切换正序）'}
      >
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
          {/* 上箭头（asc 高亮）：SVG y 轴朝下，尖朝上是小 y */}
          <path
            d="M6 2 L2.5 5.5 L9.5 5.5 Z"
            className={dir === 'asc' ? styles.arrowOn : styles.arrowOff}
          />
          {/* 下箭头（desc 高亮）：尖朝下是大 y */}
          <path
            d="M6 12 L2.5 8.5 L9.5 8.5 Z"
            className={dir === 'desc' ? styles.arrowOn : styles.arrowOff}
          />
        </svg>
      </button>
    </span>
  );
}

export function FilterBar({
  view,
  school,
  charGroup,
  figGroup,
  charSort,
  charDir,
  figSort,
  figDir,
  onView,
  onSchool,
  onCharGroup,
  onFigGroup,
  onCharSort,
  onCharDir,
  onFigSort,
  onFigDir,
}: {
  view: View;
  /** 学校筛选：null = 全部（两套列表都生效） */
  school: string | null;
  charGroup: CharGroup;
  figGroup: FigGroup;
  /** 角色排序标准 + 方向 */
  charSort: SortCriterion;
  charDir: SortDir;
  /** 手办排序标准 + 方向 */
  figSort: SortCriterion;
  figDir: SortDir;
  onView: (v: View) => void;
  onSchool: (v: string | null) => void;
  onCharGroup: (v: CharGroup) => void;
  onFigGroup: (v: FigGroup) => void;
  onCharSort: (v: SortCriterion) => void;
  onCharDir: (d: SortDir) => void;
  onFigSort: (v: SortCriterion) => void;
  onFigDir: (d: SortDir) => void;
}) {
  return (
    <div className={styles.bar}>
      {/* 视图：角色列表 / 手办列表 */}
      <Field label="列表" value={view} onChange={(v) => onView(v as View)}>
        <option value="characters">角色列表</option>
        <option value="figures">手办列表</option>
      </Field>

      {/* 学校筛选：两边都能用（手办带角色所属学校） */}
      <Field label="学校" value={school ?? ''} onChange={(v) => onSchool(v === '' ? null : v)}>
        <option value="">全部</option>
        {schools.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Field>

      {/* 分组：两套选项跟随视图 */}
      {view === 'characters' ? (
        <Field label="分组" value={charGroup} onChange={(v) => onCharGroup(v as CharGroup)}>
          <option value="school">按学校</option>
          <option value="series">按社团</option>
          <option value="none">不分组</option>
        </Field>
      ) : (
        <Field label="分组" value={figGroup} onChange={(v) => onFigGroup(v as FigGroup)}>
          <option value="character">按角色</option>
          <option value="manufacturer">按厂商</option>
          <option value="type">按类型</option>
          <option value="none">不分组</option>
        </Field>
      )}

      {/* 排序：标准下拉 + 方向切换按钮（两套标准跟随视图） */}
      {view === 'characters' ? (
        <SortField
          label="排序"
          value={charSort}
          dir={charDir}
          options={CHAR_SORT_OPTIONS}
          onCriterion={(c) => onCharSort(c)}
          onDir={(d) => onCharDir(d)}
        />
      ) : (
        <SortField
          label="排序"
          value={figSort}
          dir={figDir}
          options={SORT_FIELDS.map((o) => ({ key: o.key, label: o.label }))}
          onCriterion={(c) => onFigSort(c as SortField)}
          onDir={(d) => onFigDir(d)}
        />
      )}
    </div>
  );
}

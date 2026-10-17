import { useMemo } from 'react';
import { useSessionState } from '../hooks/useSessionState';
import { characters, figures, TOTAL_CHARACTERS, TOTAL_FIGURES, TOTAL_RELEASED } from '../data/characters';
import { normalize } from '../lib/search';
import { applySortWithDir, type SortField, type SortDir } from '../lib/filters';
import { PageHeader } from '../components/layout/PageHeader';
import { CharacterGrid } from '../components/character/CharacterGrid';
import { FigureGrid } from '../components/figure/FigureGrid';
import { CompactSearch } from '../components/filters/CompactSearch';
import { FilterBar, type View, type CharGroup, type FigGroup, type SortCriterion } from '../components/filters/FilterBar';
import { EmptyState } from '../components/ui/EmptyState';
import { manufacturerLabel, PRODUCT_TYPE_LABEL } from '../types/figure';
import styles from './CharacterIndexPage.module.css';

/** 主页：筛选条（列表 / 学校 / 分组 / 排序）+ 内容区。
 *  角色列表与手办列表各有一套「分组 + 排序（标准 + 方向）」。 */
export function CharacterIndexPage() {
  // 筛选状态存 sessionStorage：切到别的页再回来（乃至刷新）不丢
  const [q, setQ] = useSessionState<string>('filter.q', '');
  const [view, setView] = useSessionState<View>('filter.view', 'characters');
  const [school, setSchool] = useSessionState<string | null>('filter.school', null);
  const [charGroup, setCharGroup] = useSessionState<CharGroup>('filter.charGroup', 'school');
  const [figGroup, setFigGroup] = useSessionState<FigGroup>('filter.figGroup', 'character');
  const [charSort, setCharSort] = useSessionState<SortCriterion>('filter.charSort', 'count');
  const [charDir, setCharDir] = useSessionState<SortDir>('filter.charDir', 'desc');
  const [figSort, setFigSort] = useSessionState<SortCriterion>('filter.figSort', 'release');
  const [figDir, setFigDir] = useSessionState<SortDir>('filter.figDir', 'desc');

  // 角色列表：搜索 + 排序（组内同样生效）
  const charList = useMemo(() => {
    const nq = normalize(q);
    const filtered = characters.filter((c) => {
      if (school && c.school !== school) return false;
      if (!nq) return true;
      const hay = normalize(
        [c.nameZh, c.nameJa, c.nameEn, ...(c.aliases ?? []), c.series, c.school ?? ''].join(' '),
      );
      return hay.includes(nq);
    });
    const arr = [...filtered];
    const s = dirSign(charDir);
    switch (charSort) {
      case 'count':
        arr.sort((a, b) => s * (b.count - a.count) || a.id.localeCompare(b.id));
        break;
      case 'name':
        arr.sort(
          (a, b) =>
            s * a.nameZh.localeCompare(b.nameZh, 'zh-Hans-CN') * -1 ||
            a.id.localeCompare(b.id),
        );
        break;
    }
    return arr;
  }, [q, charSort, charDir, school]);

  // 手办列表：搜索 + 排序（组内同样生效）
  const figList = useMemo(() => {
    const nq = normalize(q);
    const filtered = figures.filter((f) => {
      if (school && f.school !== school) return false;
      if (!nq) return true;
      const hay = normalize(
        [
          f.characterName, f.characterNameJa, f.characterNameEn, f.manufacturer,
          PRODUCT_TYPE_LABEL[f.productType], ...(f.aliases ?? []),
        ].join(' '),
      );
      return hay.includes(nq);
    });
    return applySortWithDir(filtered, figSort as SortField, figDir);
  }, [q, figSort, figDir, school]);

  // 角色列表分组：学校 / 社团 / 不分组
  const charGrouped = useMemo<[string, typeof charList][]>(() => {
    if (charGroup === 'none') return [];
    const m = new Map<string, typeof charList>();
    for (const c of charList) {
      const k = charGroup === 'series' ? c.series : (c.school ?? '夏莱');
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'));
  }, [charList, charGroup]);

  // 手办列表分组：角色 / 厂商 / 类型 / 不分组
  const figGrouped = useMemo<[string, typeof figList][]>(() => {
    if (figGroup === 'none') return [];
    const m = new Map<string, typeof figList>();
    for (const f of figList) {
      const k =
        figGroup === 'character'
          ? f.characterName
          : figGroup === 'manufacturer'
            ? manufacturerLabel(f.manufacturer)
            : PRODUCT_TYPE_LABEL[f.productType];
      m.set(k, [...(m.get(k) ?? []), f]);
    }
    const arr = [...m.entries()];
    if (figGroup === 'character') {
      // 角色组按组内件数降序，其余按名称拼音序
      return arr.sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh-Hans-CN'));
    }
    return arr.sort((a, b) => a[0].localeCompare(b[0], 'zh-Hans-CN'));
  }, [figList, figGroup]);

  const filtering = q.trim() !== '' || school !== null;

  /** 方向 → 符号：desc=1（各标准的默认向），asc=-1 */
  function dirSign(d: SortDir): 1 | -1 {
    return d === 'desc' ? 1 : -1;
  }

  return (
    <div className="container">
      <PageHeader
        sub={
          <span className={styles.summary}>
            收录 <strong>{TOTAL_CHARACTERS}</strong> 位角色 · <strong>{TOTAL_FIGURES}</strong> 件手办 ·{' '}
            <strong>{TOTAL_RELEASED}</strong> 件已发售
          </span>
        }
        right={<CompactSearch value={q} onChange={setQ} placeholder="搜索角色…" />}
      />

      <FilterBar
        view={view}
        school={school}
        charGroup={charGroup}
        figGroup={figGroup}
        charSort={charSort}
        charDir={charDir}
        figSort={figSort}
        figDir={figDir}
        onView={setView}
        onSchool={setSchool}
        onCharGroup={setCharGroup}
        onFigGroup={setFigGroup}
        onCharSort={setCharSort}
        onCharDir={setCharDir}
        onFigSort={setFigSort}
        onFigDir={setFigDir}
      />

      {view === 'characters' ? (
        /* 角色列表 */
        charList.length === 0 ? (
          <EmptyState title="没有找到这位角色" hint="试试别的关键词。" />
        ) : charGroup === 'none' || filtering ? (
          <CharacterGrid groups={charList} />
        ) : (
          charGrouped.map(([label, items]) => (
            <section key={label} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {label}
                <span className={styles.sectionCount}>{items.length}</span>
              </h2>
              <CharacterGrid groups={items} />
            </section>
          ))
        )
      ) : (
        /* 手办列表：按 角色/厂商/类型 分组；排序作用于组内 */
        figList.length === 0 ? (
          <EmptyState title="没有找到手办" hint="试试别的关键词。" />
        ) : figGroup === 'none' || filtering ? (
          <FigureGrid figures={figList} />
        ) : (
          figGrouped.map(([label, items]) => (
            <section key={label} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {label}
                <span className={styles.sectionCount}>{items.length}</span>
              </h2>
              <FigureGrid figures={items} />
            </section>
          ))
        )
      )}
    </div>
  );
}

/**
 * 面包屑导航 —— 固定在顶栏正下方，全站唯一的一条返回路径。
 *
 * 为什么放在 AppLayout 而不是各页自己写：
 *   原先「← 全部角色」「← 星野 的其他手办」由各详情页各自渲染，样式与位置
 *   互不相同，收藏页干脆没有返回入口。集中到布局层后：
 *     · 各页面包屑的位置、字号、间距天然一致；
 *     · 新增页面只要在 buildCrumbs() 里加一条分支，不会漏挂返回入口。
 *
 * 层级 < 2 时不渲染任何东西（首页是根，不需要面包屑，也不需要「返回首页」）。
 */
import { Link, useLocation } from 'react-router-dom';
import { findFigure, findCharacter } from '../../data/characters';
import { PRODUCT_TYPE_LABEL } from '../../types/figure';
import styles from './Breadcrumbs.module.css';

type Crumb = { to?: string; label: string };

/** 按当前路径推导面包屑链（末项无 to = 当前位置，不可点） */
function buildCrumbs(path: string): Crumb[] {
  const home: Crumb = { to: '/', label: '首页' };
  const unknown: Crumb[] = [home, { label: '未找到' }];

  // /character/<id> → 首页 / 角色名
  const char = path.match(/^\/character\/(.+)$/);
  if (char) {
    const g = findCharacter(decodeURIComponent(char[1]));
    return g ? [home, { label: g.nameZh }] : unknown;
  }

  // /figure/<id> → 首页 / 角色名 / 商品类型
  const fig = path.match(/^\/figure\/(.+)$/);
  if (fig) {
    const f = findFigure(decodeURIComponent(fig[1]));
    if (!f) return unknown;
    const g = findCharacter(f.characterId);
    return [
      home,
      { to: g ? `/character/${g.id}` : '/', label: g?.nameZh ?? '角色' },
      { label: PRODUCT_TYPE_LABEL[f.productType] },
    ];
  }

  if (path.startsWith('/collection')) return [home, { label: '我的收藏' }];

  // 首页、404 页不放面包屑（404 无处可返回，首页自身就是根）
  return [];
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length < 2) return null;

  return (
    <nav className={styles.bar} aria-label="面包屑">
      <div className={`container ${styles.inner}`}>
        <ol className={styles.list}>
          {crumbs.map((c, i) => (
            <li key={`${c.label}-${i}`} className={styles.item}>
              {i > 0 && (
                <span className={styles.sep} aria-hidden="true">
                  /
                </span>
              )}
              {c.to ? (
                <Link to={c.to} className={styles.link}>
                  {c.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current="page">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

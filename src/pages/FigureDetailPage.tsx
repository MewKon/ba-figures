import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { findFigure } from '../data/characters';
import { PRODUCT_TYPE_LABEL, MANUFACTURER_LABEL, releaseHistory, tagMeta } from '../types/figure';
import { formatRelease, formatHeight } from '../lib/format';
import { formatMoney, isConverted, CONVERT_NOTE } from '../lib/currency';
import { HoverHint } from '../components/ui/HoverHint';
import { useCurrency } from '../hooks/useCurrency';
import { FigureGallery } from '../components/figure/FigureGallery';
import { CollectionButton } from '../components/collection/CollectionButton';
import { Badge } from '../components/ui/Badge';
import { Halo } from '../components/ui/Halo';
import styles from './FigureDetailPage.module.css';

/** 一次发售的展示名：初版 / 第 N 次再版 */
const releaseLabel = (i: number, total: number) =>
  i === 0 ? '初版' : total === 2 ? '再版' : `第 ${i} 次再版`;

export function FigureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reduce = useReducedMotion();
  const { code } = useCurrency();
  const figure = findFigure(id);
  // 发售历史：初版 + 各次再版（升序）。同一件手办可能有多次再版，
  // 定价/JAN/发售日逐次不同 —— 用标签页切换，避免堆成一张长表。
  const releases = figure ? releaseHistory(figure) : [];
  const [tab, setTab] = useState(0);
  const active = releases[Math.min(tab, Math.max(releases.length - 1, 0))];

  if (!figure) {
    return (
      <div className="container">
        <div className={styles.notFound}>
          <Halo size={96} thickness={3} />
          <h1 className={styles.nfTitle}>未找到这件手办</h1>
          <p className={styles.nfHint}>链接可能已失效，或该商品已不在数据集中。</p>
          <Link to="/" className={styles.backBtn}>
            返回画廊
          </Link>
        </div>
      </div>
    );
  }

  // 与发售批次无关的信息（厂牌/尺寸/社团…）
  const specs: { label: string; value: string }[] = [
    { label: '厂商', value: MANUFACTURER_LABEL[figure.manufacturer] ?? figure.manufacturer },
    { label: '商品类型', value: PRODUCT_TYPE_LABEL[figure.productType] },
    { label: '比例', value: figure.scale === 'non-scale' ? '非比例' : (figure.scale ?? '—') },
    { label: '尺寸', value: formatHeight(figure.heightMm) },
    { label: '社团 / 小队', value: figure.series },
    ...(figure.school ? [{ label: '学校', value: figure.school }] : []),
  ];

  // 随发售批次变化的信息
  const releaseSpecs: { label: string; value: string }[] = [
    { label: '发售时间', value: formatRelease(active.date) },
    { label: isConverted(code) ? '定价（换算）' : '定价', value: formatMoney(active.priceJpy, code) },
    ...(active.jan ? [{ label: 'JAN 码', value: active.jan }] : []),
    ...(active.hljCode ? [{ label: '商品编码', value: active.hljCode }] : []),
  ];

  return (
    <div className="container">
      <div className={styles.layout}>
        <motion.div
          className={styles.media}
          style={{ ['--c' as string]: figure.themeColor }}
          layoutId={reduce ? undefined : `media-${figure.id}`}
        >
          {/* 淘宝式图库：主图 + 左右切换 + 缩略图条 + 放大镜（多图时） */}
          <FigureGallery figure={figure} />
        </motion.div>

        <div className={styles.info}>
          <div className={styles.badges}>
            <Badge tone="blue">{PRODUCT_TYPE_LABEL[figure.productType]}</Badge>
            <Badge tone="char" color={figure.themeColor}>
              {figure.manufacturer}
            </Badge>
            {figure.scale && figure.scale !== 'non-scale' && (
              <Badge tone="muted">{figure.scale}</Badge>
            )}
            {releases.length > 1 && <Badge tone="muted">再版 ×{releases.length - 1}</Badge>}
            {/* 来源标签（官方 / 将来的同人等） */}
            {(figure.tags ?? []).map((t) => {
              const m = tagMeta(t);
              return (
                <Badge key={t} tone={m.tone}>
                  {m.label}
                </Badge>
              );
            })}
          </div>

          <h1 className={styles.name}>{figure.characterName}</h1>
          <p className={styles.ja}>{figure.characterNameJa}</p>
          {figure.characterNameEn && (
            <p className={styles.en}>{figure.characterNameEn}</p>
          )}

          <div className={styles.priceRow}>
            <span className={styles.price}>
              {isConverted(code) && (
                <HoverHint text={CONVERT_NOTE}>
                  <span className={styles.approx}>≈</span>
                </HoverHint>
              )}
              {formatMoney(active.priceJpy, code)}
            </span>
            <span className={styles.release}>{formatRelease(active.date)} 发售</span>
          </div>

          <CollectionButton figure={figure} variant="full" />

          {releases.length > 1 && (
            <div className={styles.tabs} role="tablist" aria-label="发售批次">
              {releases.map((r, i) => (
                <button
                  key={`${r.date}-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  className={`${styles.tab} ${i === tab ? styles.on : ''}`}
                  onClick={() => setTab(i)}
                >
                  <span className={styles.tabName}>{releaseLabel(i, releases.length)}</span>
                  <span className={styles.tabDate}>{formatRelease(r.date)}</span>
                </button>
              ))}
            </div>
          )}

          <dl className={styles.specs}>
            {specs.map((s) => (
              <div key={s.label} className={styles.specRow}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          <dl className={`${styles.specs} ${styles.releaseSpecs}`}>
            {releaseSpecs.map((s) => (
              <div key={s.label} className={styles.specRow}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          {figure.notes && <p className={styles.notes}>{figure.notes}</p>}

          {active.officialUrl && (
            <a
              className={styles.official}
              href={active.officialUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              在 HLJ 查看商品页 ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 淘宝式详情页图库：主图 + 左右切换 + 底部缩略图条。
 *
 * 设计口径：
 *   · 单图（imageUrls 为空）退化为普通 <FigureImage>，不渲染切换控件；
 *   · 缩略图同源，只是 CSS 缩小 —— 不再发一份缩略请求；
 *   · 键盘 ←/→ 可切换（主图聚焦时），Alt 文案带序号；
 *   · 图片加载失败降级占位卡（沿用 FigureImage 的 failed 思路）。
 */
import { useEffect, useState } from 'react';
import type { Figure } from '../../types/figure';
import { FigurePlaceholder } from './FigurePlaceholder';
import { HoverZoom } from './HoverZoom';
import { Icon } from '../ui/Icon';
import styles from './FigureGallery.module.css';

export function FigureGallery({ figure }: { figure: Figure }) {
  const urls = figure.imageUrls?.length ? figure.imageUrls : figure.imageUrl ? [figure.imageUrl] : [];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  // 切换手办时回到首图、清失败态
  useEffect(() => {
    setIdx(0);
    setFailed({});
  }, [figure.id]);

  const n = urls.length;
  const go = (d: number) => setIdx((i) => (n ? (i + d + n) % n : 0));

  if (n === 0 || failed[idx]) {
    return <FigurePlaceholder figure={figure} large />;
  }

  return (
    <div
      className={styles.wrap}
      onKeyDown={(e) => {
        if (n < 2) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
      tabIndex={n > 1 ? 0 : undefined}
      role={n > 1 ? 'group' : undefined}
      aria-label={n > 1 ? `商品图，共 ${n} 张` : undefined}
    >
      <div className={styles.main}>
        {/* 固定高度舞台：切图不改变页面高度（图片 contain 居中） */}
        <div className={styles.stage}>
          <img
            key={urls[idx]}
            className={styles.img}
            src={urls[idx]}
            alt={`${figure.characterName} ${figure.characterNameJa} 手办（${idx + 1}/${n}）`}
            decoding="async"
            onError={() => setFailed((f) => ({ ...f, [idx]: true }))}
          />
        </div>
        {/* 放大镜：盖在主图上；无图源时不渲染 */}
        {!failed[idx] && <HoverZoom src={urls[idx]} alt={figure.characterName} />}

        {n > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              onClick={() => go(-1)}
              aria-label="上一张"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={() => go(1)}
              aria-label="下一张"
            >
              <Icon name="chevronRight" size={18} />
            </button>
            <span className={styles.counter}>
              {idx + 1}/{n}
            </span>
          </>
        )}
      </div>

      {n > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="商品图缩略图">
          {urls.map((u, i) => (
            <button
              key={u}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={`${styles.thumb} ${i === idx ? styles.on : ''} ${failed[i] ? styles.broken : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`第 ${i + 1} 张`}
            >
              {!failed[i] && (
                <img
                  src={u}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

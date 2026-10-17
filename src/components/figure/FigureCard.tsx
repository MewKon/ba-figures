import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import type { Figure } from '../../types/figure';
import { PRODUCT_TYPE_LABEL, tagMeta } from '../../types/figure';
import { formatRelease } from '../../lib/format';
import { formatMoney, isConverted } from '../../lib/currency';
import { useCurrency } from '../../hooks/useCurrency';
import { FigureImage } from './FigureImage';
import { Badge } from '../ui/Badge';
import { CollectionButton } from '../collection/CollectionButton';
import styles from './FigureCard.module.css';

export function FigureCard({ figure }: { figure: Figure }) {
  const reduce = useReducedMotion();
  const { code } = useCurrency();

  return (
    <motion.article
      className={styles.card}
      style={{ ['--c' as string]: figure.themeColor }}
      layout={!reduce}
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <Link to={`/figure/${figure.id}`} className={styles.link} state={{ fromGallery: true }}>
        <div className={styles.media}>
          {/* 共享元素：与详情页大图同一 layoutId */}
          <motion.div layoutId={reduce ? undefined : `media-${figure.id}`} className={styles.mediaInner}>
            <FigureImage figure={figure} />
          </motion.div>

          <div className={styles.badges}>
            <Badge tone="blue">{PRODUCT_TYPE_LABEL[figure.productType]}</Badge>
            {figure.scale && figure.scale !== 'non-scale' && (
              <Badge tone="char" color={figure.themeColor}>
                {figure.scale}
              </Badge>
            )}
            {/* 再版条目已合并进本条，这里只提示「卖过几次」 */}
            {figure.rereleases?.length ? (
              <Badge tone="muted">再版 ×{figure.rereleases.length}</Badge>
            ) : null}
            {/* 来源标签（官方 / 将来的同人等），未知标签原样显示 */}
            {(figure.tags ?? []).map((t) => {
              const m = tagMeta(t);
              return (
                <Badge key={t} tone={m.tone}>
                  {m.label}
                </Badge>
              );
            })}
          </div>

          <CollectionButton figure={figure} variant="icon" />
        </div>

        <div className={styles.body}>
          <h3 className={`${styles.name} ellipsis`}>{figure.characterName}</h3>
          <p className={`${styles.ja} ellipsis`}>{figure.characterNameJa}</p>
          <div className={styles.meta}>
            <span className={styles.mfr}>{figure.manufacturer}</span>
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
            <span>{formatRelease(figure.releaseDate)}</span>
          </div>
          {/* 非日元时前缀 ≈，提示这是按汇率折算的指示价而非商家标价 */}
          <div className={styles.price}>
            {isConverted(code) && <span className={styles.approx}>≈</span>}
            {formatMoney(figure.priceJpy, code)}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

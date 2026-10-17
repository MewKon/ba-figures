/**
 * 角色立绘（SchaleDB 官方学生立绘，透明底 webp）。
 *
 * 与 FigureImage 分开：立绘在主页角色卡用，手办商品图在角色详情页用。
 * 两级降级：
 *   1. public/portraits/<characterId>.webp 加载成功 → 渲染立绘
 *   2. 否则（文件缺失 / 加载失败）→ 渐变占位卡
 *
 * 立绘是透明底，所以外层是色块底 + object-fit: contain 让角色完整可见。
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Figure } from '../../types/figure';
import { FigurePlaceholder } from '../figure/FigurePlaceholder';
import { Halo } from '../ui/Halo';
import styles from './CharacterPortrait.module.css';

/**
 * 会话内已成功加载过的立绘 URL。
 * 路由前后台切换会整页卸载重建（AnimatePresence），组件 state 的 loaded
 * 会归零，导致返回首页时所有立绘重闪「加载中」——哪怕图片就在 HTTP 缓存里。
 * 模块级 Set 存住成功记录：重挂载时直接按已加载渲染，不闪加载态。
 */
const loadedSrcs = new Set<string>();

export function CharacterPortrait({
  characterId,
  name,
  nameJa,
  themeColor,
  fallback,
  priority = false,
}: {
  /** 立绘 public/portraits/<characterId>.webp，与 roster id 一一对应 */
  characterId: string;
  name: string;
  nameJa: string;
  themeColor: string;
  /** 无立绘时的占位数据源；0 件角色没有手办可取，留空则渲染纯色占位 */
  fallback?: Figure;
  /** 首屏立绘标 true：立即加载 + 高优先级，不参与懒加载排队 */
  priority?: boolean;
}) {
  const src = `portraits/${characterId}.webp`;
  const [failed, setFailed] = useState(false);
  // 初值取会话缓存：这张图之前加载成功过 → 直接按已就绪渲染
  const [loaded, setLoaded] = useState(() => (src ? loadedSrcs.has(src) : false));

  // 切换角色时重置失败态；loaded 按缓存重新判定
  useEffect(() => {
    setFailed(false);
    setLoaded(loadedSrcs.has(src));
  }, [src]);

  if (failed) {
    return (
      <div className={styles.fallback}>
        {fallback ? (
          <FigurePlaceholder figure={fallback} />
        ) : (
          <div
            className={styles.bare}
            style={{ ['--c' as string]: themeColor } as CSSProperties}
            role="img"
            aria-label={name}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.stage} style={{ ['--c' as string]: themeColor } as CSSProperties}>
      {/* 图片未就绪时显示光环加载件；loaded 后淡出 */}
      <span className={`${styles.loading} ${loaded ? styles.loadingOut : ''}`} aria-hidden="true">
        <Halo size={44} thickness={2} />
        <span className={styles.loadingText}>加载中</span>
      </span>
      <img
        className={`${styles.img} ${loaded ? styles.imgIn : ''}`}
        src={src}
        alt={`${name} ${nameJa}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => {
          loadedSrcs.add(src);
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

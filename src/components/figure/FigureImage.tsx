/**
 * 图片两级降级：
 *   1. figure.imageUrl 存在 → 渲染 <img>
 *   2. 否则 / 加载失败 → 渲染渐变占位卡
 *
 * 不做本地文件存在性探测（那需要发请求并吞 404，属过度设计）——
 * 用户把 imageUrl 写成 'images/xxx.jpg' 即可，与本地图共用同一条路径。
 *
 * 模块级 loadedSrcs：路由前后台切换会整页卸载重建，state 归零会让
 * 已缓存图片重闪空白；记住成功过的 src，重挂载直接显示。
 */
import { useEffect, useState } from 'react';
import type { Figure } from '../../types/figure';
import { FigurePlaceholder } from './FigurePlaceholder';
import { Halo } from '../ui/Halo';
import styles from './FigureImage.module.css';

const loadedSrcs = new Set<string>();

export function FigureImage({
  figure,
  large = false,
}: {
  figure: Figure;
  large?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(() =>
    figure.imageUrl ? loadedSrcs.has(figure.imageUrl) : false,
  );

  // 切换手办时重置状态 —— 否则组件实例复用会带着上一张的失败状态
  useEffect(() => {
    setFailed(false);
    setLoaded(figure.imageUrl ? loadedSrcs.has(figure.imageUrl) : false);
  }, [figure.id, figure.imageUrl]);

  if (!figure.imageUrl || failed) {
    return <FigurePlaceholder figure={figure} large={large} />;
  }

  // img 恒在 DOM 同一位置（结构不随加载态切换，motion 布局测量才稳定）：
  //   · 未加载 → opacity:0，底下垫一层浅底 + 光环「加载中」
  //   · 已加载 → 正常显示，垫层隐藏
  return (
    <div className={`${styles.frame} ${large ? styles.large : ''}`}>
      {!loaded && (
        <div className={styles.loading} role="status" aria-label="图片加载中">
          <Halo size={large ? 72 : 40} thickness={2} />
          <span className={styles.loadingText}>加载中</span>
        </div>
      )}
      <img
        className={styles.img}
        style={loaded ? undefined : { opacity: 0 }}
        src={figure.imageUrl}
        alt={`${figure.characterName} ${figure.characterNameJa} 手办`}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          loadedSrcs.add(figure.imageUrl!);
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

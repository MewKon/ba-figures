/**
 * 淘宝式悬停放大镜：鼠标在主图上移动时，旁边浮一块 2.2× 的局部放大图。
 *
 * 实现口径：
 *   · 用同一张大图做放大源，不额外请求高清图；
 *   · 不用 background-size 百分比 —— 主图是 contain 显示，容器宽高比和
 *     图片不一致时百分比缩放会把图拉扁。这里按图片的自然尺寸精算：
 *     放大镜内容 = 图片原图 × ZOOM，position 随鼠标按像素平移；
 *   · 鼠标坐标只写 style 不进 React state，mousemove 零重渲染。
 */
import { useCallback, useRef, useState, type MouseEvent } from 'react';
import styles from './HoverZoom.module.css';

const ZOOM = 2.2; // 放大倍数
const CURSOR = 72; // 指示环直径，与 CSS 保持一致

export function HoverZoom({ src, alt }: { src: string; alt: string }) {
  const [show, setShow] = useState(false);
  const lensRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const lens = lensRef.current;
    if (lens) {
      // 图片自然尺寸（加载失败时 naturalWidth 为 0，跳过即可）
      const img = lens.querySelector('img');
      const nw = img?.naturalWidth ?? 0;
      const nh = img?.naturalHeight ?? 0;
      if (nw && nh) {
        // 鼠标相对主图 contain 绘制区的比例。
        // .stage 是 object-fit:contain，绘制区 = 容器内等比缩放后的区域
        const scale = Math.min(r.width / nw, r.height / nh);
        const drawW = nw * scale;
        const drawH = nh * scale;
        const offX = (r.width - drawW) / 2;
        const offY = (r.height - drawH) / 2;
        const x = Math.min(Math.max((e.clientX - r.left - offX) / drawW, 0), 1);
        const y = Math.min(Math.max((e.clientY - r.top - offY) / drawH, 0), 1);

        // 放大镜内容 = 原图 × ZOOM（像素），尺寸 + 平移都走 CSS 变量
        lens.style.setProperty('--zw', `${nw * ZOOM}px`);
        lens.style.setProperty('--zh', `${nh * ZOOM}px`);
        lens.style.setProperty('--zx', `${-(x * nw * ZOOM - lens.clientWidth / 2)}px`);
        lens.style.setProperty('--zy', `${-(y * nh * ZOOM - lens.clientHeight / 2)}px`);
      }
    }
    if (cursorRef.current) {
      // 指示环 absolute 在 wrap 内：像素坐标（含 -半宽居中）
      cursorRef.current.style.left = `${e.clientX - r.left - CURSOR / 2}px`;
      cursorRef.current.style.top = `${e.clientY - r.top - CURSOR / 2}px`;
    }
  }, []);

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={onMove}
    >
      {show && (
        <>
          <div
            ref={lensRef}
            className={styles.lens}
            role="img"
            aria-label={`${alt}（放大预览）`}
          >
            {/* 真实 <img> 而非 background-image：拿得到 naturalWidth 做精算，
                且加载失败/未完成时自然退化为底色 */}
            <img src={src} alt="" className={styles.lensImg} decoding="async" />
          </div>
          <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />
        </>
      )}
    </div>
  );
}

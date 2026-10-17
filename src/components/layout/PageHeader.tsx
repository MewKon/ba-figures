import styles from './PageHeader.module.css';

/**
 * 紧凑页头：一行标题 + 一行说明，替代原先的大 hero。
 * `title` 可省 —— 有些页面标题本身是多余的（如主页直接把汇总数字当标题行）。
 */
export function PageHeader({
  title,
  sub,
  right,
}: {
  title?: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className={styles.head}>
      <div className={styles.text}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
      {right && <div className={styles.right}>{right}</div>}
    </header>
  );
}

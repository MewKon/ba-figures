import { PageHeader } from '../components/layout/PageHeader';
import styles from './AboutPage.module.css';

/** 站内数据来源（与脚本采集 / 手动补录实际用到的站点一一对应） */
const SOURCES = [
  {
    name: 'HobbyLink Japan（HLJ）',
    url: 'https://www.hlj.com',
  },
  {
    name: 'SchaleDB',
    url: 'https://schaledb.com',
  },
  {
    name: 'hpoi 手办维基',
    url: 'https://www.hpoi.net',
  },
  {
    name: 'Good Smile Company 官网',
    url: 'https://www.goodsmile.info',
  },
];

export function AboutPage() {
  return (
    <div className="container">
      <PageHeader title="关于本站" sub="碧蓝档案手办收集" />
      <div className={styles.wrap}>
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>这是什么</h2>
          <div className={styles.text}>
            <p>
              一个记录《碧蓝档案》手办发售信息的静态站点：按角色浏览商品、查看发售日历，
              并支持多币种换算显示。
            </p>
            <p>本站为非营利个人项目，与 Nexon / Yostar 及各手办厂商均无关联。</p>
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>数据来源</h2>
          <div className={styles.text}>
            <p>本站数据整理自以下公开站点；如有遗漏或错误，欢迎提 Issue 反馈。</p>
          </div>
          <div className={styles.sourceList}>
            {SOURCES.map((s) => (
              <div key={s.url} className={styles.source}>
                <span className={styles.sourceName}>{s.name}</span>
                <a className={styles.sourceLink} href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.url.replace('https://', '')} ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>版权说明</h2>
          <div className={styles.text}>
            <p>
              「碧蓝档案」及相关名称、角色形象版权归 NEXON Games / Yostar 等原权利方所有；
              商品图片版权归各手办厂商所有。本站图片仅作收集记录展示用途。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

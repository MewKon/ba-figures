import { ReleaseCalendar } from '../components/figure/ReleaseCalendar';
import styles from './CalendarPage.module.css';

/** 发售日历页：未来 12 个月的发售节奏（从主页拆出来，独立直达） */
export function CalendarPage() {
  return (
    <div className="container">
      <header className={styles.head}>
        <h1 className={styles.title}>发售日历</h1>
        <p className={styles.sub}>未来 12 个月的官方新品节奏，点月份查看该月手办与合计价。</p>
      </header>
      <ReleaseCalendar />
    </div>
  );
}

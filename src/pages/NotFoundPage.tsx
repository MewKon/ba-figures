import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className="container">
      <EmptyState
        title="页面不存在"
        hint="这个地址没有对应的内容。"
        action={
          <Link to="/" className={styles.btn}>
            返回画廊
          </Link>
        }
      />
    </div>
  );
}

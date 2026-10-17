import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { figures } from './data/characters';
import { CollectionProvider } from './hooks/useCollection';
import { CurrencyProvider } from './hooks/useCurrency';
import { AppLayout } from './components/layout/AppLayout';
import { CharacterIndexPage } from './pages/CharacterIndexPage';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { FigureDetailPage } from './pages/FigureDetailPage';
import { CollectionPage } from './pages/CollectionPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    // HashRouter：静态托管零配置，深链刷新不会 404，
    // 且不受 file:// 下 pushState 被拒的影响
    <HashRouter>
      {/* 显示货币要覆盖全部价格（卡片/详情/收藏统计），故包在最外层 */}
      <CurrencyProvider>
        <CollectionProvider figures={figures}>
          <Routes>
            <Route element={<AppLayout />}>
              {/* 主页 = 角色索引（按人物显示，标注手办数） */}
              <Route index element={<CharacterIndexPage />} />
              {/* 角色 → 该角色的手办列表 */}
              <Route path="character/:id" element={<CharacterDetailPage />} />
              {/* 单件手办详情（含图片） */}
              <Route path="figure/:id" element={<FigureDetailPage />} />
              <Route path="collection" element={<CollectionPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </CollectionProvider>
      </CurrencyProvider>
    </HashRouter>
  );
}

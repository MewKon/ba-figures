import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// dev 与 build 的 base 必须分开：
//   build → './'（相对路径，静态托管/子目录/双击都能用，交给 hash 路由足够）
//   dev   → '/ba/'：dev 服务器要经 nginx 的 location /ba/ 反代到外部，
//           而 Vite 注入的 /@vite/client、/@react-refresh、/src/main.tsx
//           全是 base 前缀的绝对路径，base 留在 '/' 会让这些请求落到 nginx
//           的 / 兜底（转发给别的后端）而不是本服务器 → 页面白屏。
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/ba/' : './',
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    // 仅监听回环：对外唯一入口是 nginx，不额外暴露 dev 端口
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    // nginx 反代下 Host 是 127.0.0.1:8080 或 :8443，与 dev 服务器不一致，需放行
    allowedHosts: true,
    // ⚠️ 刻意不设 hmr.clientPort / port / protocol。
    //   Vite 把 clientPort 在启动时静态写进 /@vite/client（hmrPort 是常量），
    //   设成 8080 就会把 HTTPS 入口(8443)的 ws 也指向 8080 → ERR_SSL_PROTOCOL_ERROR。
    //   留空时客户端回落成 `location.port` 与 `location.protocol`，
    //   即「页面从哪个端口进来就连回哪个端口」：:8080 走 ws、:8443 走 wss，
    //   加多少个入口都不用改配置。前提是各入口都要有 /ba/ 前缀能反代到 ws。
    //   path 同理留空，默认值 = base('/ba/')，正好落在 nginx 的 /ba/ 下。
  },
}));

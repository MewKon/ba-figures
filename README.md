# 碧蓝档案 手办收集

《碧蓝档案》(Blue Archive) 手办信息画廊。
碧蓝档案风格：明亮蓝白配色 + 光环图腾 + 流畅动效。

## 信息架构

```
/                      角色索引 —— 只列人物，每位标注有几件手办（按学校/社团分组）
  /#/character/<id>    该角色的全部手办（可按类型细分：比例手办 / 黏土人 / figma …）
    /#/figure/<id>     单件手办详情（大图 + 规格 + 收藏）
/#/collection          我的收藏
```

## 快速开始

```bash
npm install
npm run dev          # http://localhost:5173
```

生产构建与预览：

```bash
npm run build
npm run preview      # http://localhost:4173
```

> **不要双击 `dist/index.html` 打开。** Vite 产物是 `<script type="module" crossorigin>`，
> `file://` 下浏览器会按 CORS 拒绝加载模块脚本。请用 `npm run preview` 或任意静态服务器。
> 路由用 `HashRouter`（URL 形如 `#/figure/<id>`），静态托管到对象存储 / GitHub Pages 无需额外配置。

## 技术栈

Vite 8 · React 19 · TypeScript 5.9 · react-router-dom 7 · motion（framer-motion）· CSS Modules + CSS 变量。
无后端，页面侧数据全静态。

## 数据

网页唯一数据源是 **`src/data/figures.json`**（171 件手办，随采集更新）。

### 数据从哪来

全自动，来自 **HLJ（hlj.com）** 的公开商品页 —— 其 `robots.txt` 为 `allow: /`，
仅禁 `/account/` 等三个路径，`/search` 与商品页均允许抓取。

| 字段 | 来源 |
|---|---|
| JAN 码 / 厂商 / 商品图 / 日元定价 | 商品页 `<script type="application/ld+json">`（schema.org/Product） |
| 发售日 / Code / 系列 | 商品页规格表 `<li>Key: Value</li>` |
| **中文名 / 日文名 / 学校 / 社团** | **SchaleDB**（Blue Archive 公开数据项目），`data/{zh,jp,en}/students.json` |
| 昵称 / 拼音别名 | `scripts/generate.ts` 里的 `NAME_ALIASES` + SchaleDB 名 |

采集**只访问 HLJ 搜索页与商品页**，单线程/有限并发 + 描述性 UA + 429 自动降速 + 本地缓存（重跑不重抓）。
抓到的原始数据落在 `data/raw/`（已 gitignore），视为不可信输入。

### 重新采集

```bash
npm run figures:refresh     # 采集 + 角色表 + 图片 + 生成，一条龙
# 或分步：
npm run figures:collect      # HLJ 搜索翻页 + 商品页 → data/raw/hlj/
npm run figures:characters   # SchaleDB 角色表 → data/raw/schaledb/characters.json
npm run figures:images       # 下载商品图 → public/figures/
npm run figures:generate     # 合并 + 清洗 → src/data/figures.json
```

生成时会打印未匹配到权威角色的商品（NPC / 卫星角色），可在
`scripts/generate.ts` 的 `EXTRA_CHARACTERS` 里人工补录中文名/日文名/学校/社团后重跑。
被识别为周边（毛绒、亚克力立牌、挂毯、服装、盲盒整盒等）的商品会自动排除，只保留手办：
比例手办 / 黏土人 / figma / POP UP PARADE / 拼装模型。

### 用中文名搜索但角色没收录？

`characterMeta` 由 SchaleDB 自动生成，无需手写。只搜索别名（如昵称、拼音）不全时，
在 `scripts/generate.ts` 的 `EXTRA_CHARACTERS[<key>].aliases` 补即可，重跑 `figures:generate`。

## 图片

商品图**下载到本地**放在 `public/figures/<slug>.jpg`（不是热链）——
既不占用 HLJ 的带宽，也不依赖其可用性。下载：

```bash
npm run figures:images       # 已存在的自动跳过；--force 重下
```

图片素材版权归原厂商，仅供个人收藏检索使用。

**降级**：`imageUrl` 缺失或加载失败时，自动回退成 `themeColor` 渐变占位卡
（角色主题色 + 首字 + 光环），所以即便某张图挂了也不会出现破图图标。

想换成自己的图：把文件放进 `public/images/`，再把该条数据的 `imageUrl` 改成
`images/<名字>` 即可（相对路径，配 `base: './'`，挂子路径也能正确解析）。

## 收藏清单

标记「已拥有 / 想要」存在浏览器 `localStorage`（key `ba-figures:collection:v1`），
不上传、不跨设备。刷新保留，导航栏计数实时同步，收藏页有件数/已花金额/按厂商与类型分布。
坏数据（手改 localStorage、无痕模式配额满）会自动降级为空清单，不会白屏。

## 目录结构

```
src/
  types/figure.ts       数据模型（前端与采集脚本共用）
  data/figures.json     ★ 网页唯一数据源
  data/meta.ts          从 figures 派生的筛选选项与统计
  lib/                  search / filters / format / stats（纯函数）
  hooks/                useCollection（Context + localStorage）/ useDebouncedValue
  components/           layout / figure / filters / collection / ui
  pages/                Gallery / FigureDetail / Collection / NotFound
  styles/               tokens.css（BA 蓝白色板与令牌）/ global.css
scripts/
  collect.ts            HLJ 采集
  fetch-characters.ts   SchaleDB 角色表
  generate.ts           合并清洗 → figures.json
  lib/hlj.ts            HTTP + 解析纯函数
data/raw/               采集原始数据（gitignore）
```

## 无障碍

全部动效包在 `useReducedMotion()` 内，系统开启「减少动态效果」后动画自动消失；
焦点环始终可见；图标按钮带屏幕阅读器文本。

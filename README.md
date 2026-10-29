# 碧蓝档案 手办收集

《碧蓝档案》手办信息画廊。
碧蓝档案风格：明亮蓝白配色 + 光环图腾 + 流畅动效。

**线上地址**：https://ba-figures.saveslot.xyz

## 信息架构

```
/                      角色索引 —— 只列人物，每位标注有几件手办
  /#/character/<id>    该角色的全部手办
    /#/figure/<id>     单件手办详情
/#/collection          我的收藏
/#/calendar            发售日历
/#/about               数据来源与关于
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

路由用 `HashRouter`，静态托管到对象存储 / GitHub Pages 无需额外配置。

## 技术栈

Vite 8 · React 19 · TypeScript 5.9 · react-router-dom 7 · motion · CSS Modules + CSS 变量。
无后端，页面侧数据全静态。页脚访问量由不蒜子提供。

## 数据

- **`src/data/figures.json`** —— 170 件手办
- **`src/data/roster.json`** —— 128 位角色权威表

数据整理自公开站点：HLJ、SchaleDB、hpoi 手办维基、Good Smile Company 官网，
详见站内「关于」页。商品图片版权归原厂商，仅供个人收藏检索使用。

## 图片

商品图与角色立绘放在 `public/figures/`、`public/portraits/`。

## 收藏清单

标记「已拥有 / 想要」存在浏览器 `localStorage`，
不上传、不跨设备。刷新保留，导航栏计数实时同步，收藏页有件数/已花金额/按厂商与类型分布。

## 目录结构

```
src/
  types/figure.ts       数据模型
  data/figures.json     ★ 手办数据
  data/roster.json      ★ 角色权威表
  data/characters.ts    把 roster + figures 组装成页面用的角色/统计
  lib/                  search / filters / format / stats
  hooks/                useCollection / useSessionState 等
  components/           layout / character / figure / filters / collection / ui
  pages/                CharacterIndex / CharacterDetail / FigureDetail / Collection / Calendar / About / NotFound
  styles/               tokens.css / global.css
public/
  icons/                站点图标
  figures/  portraits/  商品图 / 立绘
```

## 无障碍

全部动效包在 `useReducedMotion()` 内，系统开启「减少动态效果」后动画自动消失；
焦点环始终可见；图标按钮带屏幕阅读器文本。

## 许可

代码 MIT。数据与图片版权归 respective 原权利方所有，仅供个人收藏检索使用。

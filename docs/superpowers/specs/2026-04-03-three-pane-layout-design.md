# 三栏布局组件设计文档

## 概述

新增一个基于现有 `SplitLayout` 设计风格的三栏布局组件，用于承载拖拽布局场景 2 的页面骨架。该组件只负责布局和折叠行为，不负责业务内容，左侧菜单区、中间画布区、右侧配置区的内容均由插槽传入。

## 目标

- 提供稳定的三栏页面骨架
- 统一左栏、主区域、右栏的布局关系
- 内建左右侧边栏折叠能力
- 与现有 `SplitLayout` 保持接近的 API 风格
- 支持拖拽布局场景 2 第一阶段快速落地

## 非目标

- 不实现拖拽逻辑
- 不实现画布组件编排
- 不实现右侧属性联动
- 不实现布局持久化
- 不改造现有 `SplitLayout`

## 需求总结

| 项目 | 选择 |
|------|------|
| 组件形式 | 独立 `ThreePaneLayout` |
| 内容承载 | 插槽式组合组件 |
| 左栏折叠 | 缩成窄条并保留切换按钮 |
| 右栏折叠 | 完全隐藏，仅保留主区域右侧贴边按钮 |
| 主区域 | 始终占据剩余空间 |
| 适用页面 | 拖拽布局场景 2 |

## 方案对比

### 方案 A：新增独立三栏布局组件（推荐）

新增 `ThreePaneLayout`，API 风格参考 `SplitLayout`，但单独处理双侧边栏状态和右侧贴边按钮逻辑。

优点：

- 不污染现有单侧布局组件
- 语义清晰，维护边界明确
- 更适合后续场景页复用

缺点：

- 会新增一套布局组件代码

### 方案 B：改造现有 `SplitLayout`

在 `SplitLayout` 上扩展左右两侧同时存在的能力。

优点：

- 复用已有实现

缺点：

- 让单侧布局组件承担过多职责
- 容易影响已有使用方
- 右栏完全隐藏和贴边按钮逻辑会让组件语义变复杂

### 方案 C：页面内写死三栏结构

在场景 2 页面中直接写布局，不抽成公共组件。

优点：

- 首次开发最快

缺点：

- 不可复用
- 折叠逻辑会散落在页面里
- 不利于后续页面统一

## 推荐方案

采用方案 A，新增独立 `ThreePaneLayout` 组件。该组件负责：

- 三栏布局结构
- 左右栏宽度管理
- 左右栏折叠状态
- 右栏折叠后的贴边展开按钮

页面只负责传入内容，不承担布局细节。

## 组件设计

### 组合式 API

```tsx
<ThreePaneLayout
  defaultLeftCollapsed={false}
  defaultRightCollapsed={false}
  leftWidth="280px"
  leftCollapsedWidth="64px"
  rightWidth="320px"
>
  <ThreePaneLayout.LeftSidebar>{leftContent}</ThreePaneLayout.LeftSidebar>
  <ThreePaneLayout.Main>{canvasContent}</ThreePaneLayout.Main>
  <ThreePaneLayout.RightSidebar>{rightContent}</ThreePaneLayout.RightSidebar>
</ThreePaneLayout>
```

### 子组件

- `ThreePaneLayout.LeftSidebar`
- `ThreePaneLayout.Main`
- `ThreePaneLayout.RightSidebar`
- `ThreePaneLayout.LeftToggle`
- `ThreePaneLayout.RightToggle`

### 状态模式

组件同时支持：

- 非受控模式：通过 `defaultLeftCollapsed`、`defaultRightCollapsed` 初始化
- 受控模式：通过 `leftCollapsed`、`rightCollapsed` 与对应回调管理

### Props 草案

```ts
interface ThreePaneLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultLeftCollapsed?: boolean
  defaultRightCollapsed?: boolean
  leftCollapsed?: boolean
  rightCollapsed?: boolean
  onLeftCollapsedChange?: (collapsed: boolean) => void
  onRightCollapsedChange?: (collapsed: boolean) => void
  leftWidth?: string
  leftCollapsedWidth?: string
  rightWidth?: string
}
```

## 行为规则

### 左侧边栏

- 展开时使用 `leftWidth`
- 折叠时使用 `leftCollapsedWidth`
- 折叠后仍保留在正常文档流中
- 折叠后保留切换按钮，允许用户重新展开

### 中间主区域

- 永远使用 `flex-1`
- 占据左右侧边栏之外的剩余空间
- 作为画布区域容器
- 当右栏隐藏时自动扩展

### 右侧边栏

- 展开时使用 `rightWidth`
- 折叠后完全隐藏，不保留占位宽度
- 展开状态下可在右栏内部显示折叠按钮
- 折叠状态下在主区域右边缘显示贴边悬浮按钮，用于重新展开

## 视觉与交互约束

- 布局整体使用 `flex` 横向排列
- 左右栏和主区域均支持独立背景、边框与内容滚动
- 宽度切换使用平滑过渡
- 右侧贴边按钮需要固定在主区域右边缘，保证右栏折叠后仍易于发现
- 组件只提供结构和基础交互，不绑定具体视觉内容

## 文件规划

```text
packages/ui/src/components/custom/
└── three-pane-layout/
    └── index.tsx

packages/pages/src/
└── drag-layout-scene-2-page.tsx

apps/web/src/app/(app)/
└── drag-layout-scene-2/
    └── page.tsx
```

## 场景 2 页面第一阶段范围

第一阶段仅完成页面布局壳子：

- 左侧菜单占位区
- 中间画布占位区
- 右侧配置占位区
- 左右侧边栏折叠交互

第一阶段不接入以下能力：

- 拖拽组件到画布
- 组件属性编辑
- 画布内布局状态管理
- localStorage 持久化
- 与现有拖拽场景 1 的组件注册表联动

## 数据流

第一阶段组件内部只维护布局 UI 状态：

- 左栏是否折叠
- 右栏是否折叠

业务内容通过子组件插槽直接渲染，不经过布局组件处理。

## 测试建议

至少覆盖以下验证点：

- 默认三栏渲染正确
- 左栏折叠后宽度收缩为窄条
- 右栏折叠后不再占据布局宽度
- 右栏折叠时贴边按钮可见且可重新展开
- 受控与非受控模式都可正常工作

## 实现顺序

1. 新增 `ThreePaneLayout` 组件
2. 暴露组合式子组件与状态上下文
3. 新增拖拽布局场景 2 页面
4. 用占位内容验证三栏结构与折叠行为
5. 后续再接入真实拖拽能力

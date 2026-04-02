# 拖拽布局场景页面设计文档

## 概述

创建一个可视化拖拽布局编辑器场景页面，用户可以从右侧侧边栏拖拽组件到画布区域，支持调整位置、大小、删除和撤销操作。

## 需求总结

| 项目 | 选择 |
|------|------|
| 用途 | 仪表盘配置页面 |
| 组件范围 | 表格组件 + 预留扩展能力 |
| 删除功能 | 支持删除 + 撤销 |
| 持久化 | localStorage + 预留后端接口 |
| 展示形式 | 缩略图 + 标题 |

## 架构设计

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│                         页面布局                              │
├─────────────────────────────────────────────────────┬───────┤
│                                                     │ 设置  │
│                    画布区域                          │ 按钮  │
│           (React Grid Layout 可拖拽网格)             ├───────┤
│                                                     │ 右侧  │
│     ┌─────────┐  ┌─────────┐  ┌─────────┐          │ 侧边栏 │
│     │ 卡片1   │  │ 卡片2   │  │ 卡片3   │          │       │
│     │ (表格)  │  │ (表格)  │  │ (表格)  │          │ 组件  │
│     │ 可拖拽  │  │ 可调整  │  │ 可删除  │          │ 列表  │
│     └─────────┘  └─────────┘  └─────────┘          │       │
│                                                     │       │
└─────────────────────────────────────────────────────┴───────┘
```

### 文件结构

```
packages/pages/src/
├── drag-layout-page.tsx          # 主页面组件
└── index.ts                      # 导出（新增导出）

apps/web/src/app/drag-layout/
└── page.tsx                      # 路由页面

packages/ui/src/components/custom/
├── drag-layout/                  # 拖拽布局相关组件
│   ├── index.ts                  # 导出
│   ├── Canvas.tsx                # 画布组件（网格布局容器）
│   ├── ComponentSidebar.tsx      # 组件侧边栏
│   ├── DraggableCard.tsx         # 可拖拽卡片
│   ├── ComponentThumbnail.tsx    # 组件缩略图
│   ├── useLayoutHistory.ts       # 撤销/重做 Hook
│   └── types.ts                  # 类型定义
└── ...
```

## 核心功能模块

### 1. 右侧侧边栏 (ComponentSidebar)

**功能：**
- 点击设置按钮从右侧滑出
- 显示可拖拽组件列表（缩略图 + 标题）
- 组件可拖拽到画布区域

**实现要点：**
- 使用 Sheet 组件（shadcn/ui）实现滑出效果
- 组件项设置 `draggable` 属性
- 拖拽开始时设置 `dataTransfer` 数据

### 2. 画布区域 (Canvas)

**功能：**
- 使用 React Grid Layout 实现网格布局
- 支持外部组件拖放
- 支持拖拽调整位置和大小
- 网格配置：12列，行高 50px

**实现要点：**
- 使用 `useContainerWidth` Hook 获取容器宽度
- 配置 `dropConfig.enabled = true` 启用外部拖放
- 实现 `onDrop` 处理新组件添加
- 实现 `onDropDragOver` 显示占位符

### 3. 可拖拽卡片 (DraggableCard)

**功能：**
- 包裹实际组件内容
- 卡片头部显示拖拽手柄 + 删除按钮
- 内容区域自适应容器尺寸

**实现要点：**
- 使用 `dragConfig.handle` 指定拖拽手柄
- 删除按钮调用父组件传递的 `onDelete` 回调
- 组件内容使用 ResizeObserver 监听尺寸变化

### 4. 状态管理

**布局数据结构：**

```typescript
interface LayoutItem {
  i: string;           // 唯一标识
  x: number;           // X 位置（列）
  y: number;           // Y 位置（行）
  w: number;           // 宽度（列）
  h: number;           // 高度（行）
  componentType: string; // 组件类型
  minW?: number;       // 最小宽度
  minH?: number;       // 最小高度
}

interface LayoutState {
  layout: LayoutItem[];
  history: LayoutItem[][];  // 撤销栈
  historyIndex: number;     // 当前历史位置
}
```

**持久化：**
- 使用 localStorage 存储布局数据
- 防抖保存（500ms）
- 预留后端 API 接口

### 5. 撤销功能 (useLayoutHistory)

**实现要点：**
- 维护历史记录栈
- 每次布局变化时推入栈
- 支持 undo/redo 操作
- 键盘快捷键：Ctrl+Z 撤销，Ctrl+Shift+Z 重做

## 外部拖拽实现

### 交互流程

| 步骤 | 操作 | 系统响应 |
|------|------|----------|
| 1 | 从侧边栏拖起组件 | 设置 `dataTransfer` 数据 |
| 2 | 拖到画布区域上方 | 触发 `onDropDragOver`，显示占位符 |
| 3 | 在画布中移动 | 占位符跟随鼠标，实时计算网格位置 |
| 4 | 松开鼠标 | 触发 `onDrop`，创建新卡片 |

### 核心代码示例

```tsx
// 侧边栏组件
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('componentType', 'table');
  }}
>
  <ComponentThumbnail component={component} />
</div>

// 画布区域
<ReactGridLayout
  dropConfig={{
    enabled: true,
    defaultItem: { w: 6, h: 4 }
  }}
  onDrop={(layout, item, e) => {
    const componentType = e.dataTransfer.getData('componentType');
    // 创建新布局项
  }}
  onDropDragOver={(e) => ({ w: 6, h: 4 })}
>
  {/* 卡片内容 */}
</ReactGridLayout>
```

## 组件类型扩展

预留扩展能力，支持后续添加更多组件类型：

```typescript
const componentRegistry = {
  table: {
    name: '表格',
    icon: TableIcon,
    thumbnail: TableThumbnail,
    defaultSize: { w: 6, h: 4 },
    render: (props) => <DataTable {...props} />,
  },
  // 预留扩展
  // chart: { ... },
  // stats: { ... },
};
```

## 依赖

- `react-grid-layout` - 拖拽布局核心库
- `@repo/ui/custom/data-table` - 表格组件
- `@radix-ui/react-dialog` - Sheet 组件基础（shadcn/ui）

## 样式

- 使用 Tailwind CSS
- 拖拽相关样式参考 React Grid Layout 文档
- 卡片样式：圆角、阴影、hover 效果

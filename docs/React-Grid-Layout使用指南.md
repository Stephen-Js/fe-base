---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: f73c1ae7cc9370f6a3e54ecc4d512b2f
    PropagateID: f73c1ae7cc9370f6a3e54ecc4d512b2f
    ReservedCode1: 304502200e1a2994e96811de5ecf9bc5521b02e3d555942b71415c307dc701ab78d6c6f4022100a379e685f35b32c23bc61570ef0f25739ac880867c4599cfea47285354894088
    ReservedCode2: 304502207676b95e58545e9f6b9fd515c10999c02291a7e7c5df1558ac87465e4ac9f753022100d22d845c26a31f0a9ab72247a13ef4e1b939126ca8aec78c9f6b88e20688d50e
---

# React Grid Layout 完整使用指南

> 本文档旨在为 AI 代理提供全面、系统的 React Grid Layout 库使用指导，涵盖从基础概念到高级用法的完整知识体系，使 AI 能够利用该库实现拖拽布局、响应式网格、可视化仪表盘等各类功能。

## 目录

1. [库概述与背景](#1-库概述与背景)
2. [安装与基础配置](#2-安装与基础配置)
3. [核心概念与数据模型](#3-核心概念与数据模型)
4. [基础使用模式](#4-基础使用模式)
5. [响应式布局](#5-响应式布局)
6. [事件回调与状态管理](#6-事件回调与状态管理)
7. [Hooks API 详解](#7-hooks-api-详解)
8. [高级用法](#8-高级用法)
9. [样式定制](#9-样式定制)
10. [常见功能实现示例](#10-常见功能实现示例)
11. [模块入口与工具函数](#11-模块入口与工具函数)
12. [最佳实践与性能优化](#12-最佳实践与性能优化)

---

## 1. 库概述与背景

### 1.1 什么是 React Grid Layout

React Grid Layout 是一个功能强大的 React 网格布局系统，类似于 Packery 和 Gridster，但专为 React 生态设计。该库完全基于 React 构建，无需依赖 jQuery，并支持响应式断点布局。

### 1.2 核心特性

| 特性 | 说明 |
|------|------|
| 纯 React 实现 | 不依赖任何 jQuery 或其他外部库 |
| TypeScript 支持 | 提供完整的类型定义 |
| 服务端渲染兼容 | 支持 SSR 应用 |
| 拖拽功能 | 支持网格项自由拖拽定位 |
| 调整大小 | 支持网格项尺寸调整 |
| 静态组件 | 支持固定不可移动的组件 |
| 响应式断点 | 支持多端适配 |
| 布局持久化 | 可序列化布局数据 |
| 多种排列策略 | 水平、垂直或关闭紧凑化 |

### 1.3 版本兼容性

| 版本 | 兼容性 |
|------|--------|
| >= 2.0.0 | React 18+，TypeScript |
| >= 0.17.0 | React 16 & 17 |

### 1.4 应用案例

该库被众多知名产品采用，包括 Grafana、Metabase、HubSpot、Kibana、Monday、AWS CloudFront Dashboards、BitMEX 和 Basedash 等。

---

## 2. 安装与基础配置

### 2.1 安装命令

```bash
npm install react-grid-layout
# 或使用 yarn
yarn add react-grid-layout
# 或使用 pnpm
pnpm add react-grid-layout
```

### 2.2 样式导入

安装完成后，必须在入口文件中引入 CSS 样式文件：

```javascript
// 在入口文件（如 index.jsx 或 App.tsx）中
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
```

或通过 HTML link 标签引入：

```html
<link rel="stylesheet" href="/node_modules/react-grid-layout/css/styles.css" />
<link rel="stylesheet" href="/node_modules/react-resizable/css/styles.css" />
```

### 2.3 TypeScript 类型支持

React Grid Layout v2+ 内置了 TypeScript 类型定义，无需额外安装类型包。

---

## 3. 核心概念与数据模型

### 3.1 LayoutItem 接口

布局项是网格中每个组件对应的数据单元：

```typescript
interface LayoutItem {
  // 唯一标识符，必须与子元素的 key 匹配（必填）
  i: string;

  // X 位置（以列为单位，从 0 开始）
  x: number;

  // Y 位置（以行为单位，从 0 开始）
  y: number;

  // 宽度（以列为单位）
  w: number;

  // 高度（以行为单位）
  h: number;

  // 最小宽度（可选，默认 0）
  minW?: number;

  // 最大宽度（可选，默认 Infinity）
  maxW?: number;

  // 最小高度（可选，默认 0）
  minH?: number;

  // 最大高度（可选，默认 Infinity）
  maxH?: number;

  // 是否为静态组件（不可拖拽和调整大小）
  static?: boolean;

  // 覆盖网格的拖拽设置
  isDraggable?: boolean;

  // 覆盖网格的调整大小设置
  isResizable?: boolean;

  // 覆盖网格的范围限制设置
  isBounded?: boolean;

  // 自定义调整大小的手柄位置
  resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
}
```

### 3.2 GridConfig 配置接口

控制网格的整体布局行为：

```typescript
interface GridConfig {
  // 网格列数（默认 12）
  cols: number;

  // 每行高度，单位像素（默认 150）
  rowHeight: number;

  // 元素间距 [水平, 垂直]（默认 [10, 10]）
  margin: [number, number];

  // 容器内边距 [水平, 垂直]（默认 null）
  containerPadding: [number, number] | null;

  // 最大行数限制（默认 Infinity）
  maxRows: number;
}
```

### 3.3 DragConfig 拖拽配置

```typescript
interface DragConfig {
  // 是否启用拖拽（默认 true）
  enabled: boolean;

  // 是否限制在容器范围内（默认 false）
  bounded: boolean;

  // CSS 选择器，指定可拖拽的手柄元素
  handle?: string;

  // CSS 选择器，指定不可拖拽的区域
  cancel?: string;

  // 开始拖拽前需要移动的像素距离（默认 3）
  threshold: number;
}
```

### 3.4 ResizeConfig 调整大小配置

```typescript
interface ResizeConfig {
  // 是否启用调整大小（默认 true）
  enabled: boolean;

  // 可用的调整手柄位置（默认 ['se']）
  handles: ResizeHandleAxis[];

  // 自定义调整手柄组件
  handleComponent?: React.ReactNode | ((axis, ref) => React.ReactNode);
}
```

### 3.5 DropConfig 外部拖放配置

```typescript
interface DropConfig {
  // 是否允许外部拖放（默认 false）
  enabled: boolean;

  // 拖放进来时的默认尺寸（默认 { w: 1, h: 1 }）
  defaultItem: { w: number; h: number };

  // 拖放悬停时的回调
  onDragOver?: (e: DragEvent) => { w?: number; h?: number } | false | void;
}
```

---

## 4. 基础使用模式

### 4.1 基本网格布局

#### 方式一：通过 layout prop 定义布局

```jsx
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

function MyGrid() {
  const { width, containerRef, mounted } = useContainerWidth();

  const layout = [
    { i: "a", x: 0, y: 0, w: 2, h: 2 },
    { i: "b", x: 2, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 5, y: 0, w: 2, h: 2, static: true },
    { i: "d", x: 0, y: 2, w: 3, h: 2 }
  ];

  return (
    <div ref={containerRef} style={{ minHeight: "400px" }}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
        >
          <div key="a" style={{ background: "#ff6b6b" }}>组件 A</div>
          <div key="b" style={{ background: "#4ecdc4" }}>组件 B（有限制）</div>
          <div key="c" style={{ background: "#45b7d1" }}>组件 C（静态）</div>
          <div key="d" style={{ background: "#96ceb4" }}>组件 D</div>
        </ReactGridLayout>
      )}
    </div>
  );
}
```

#### 方式二：通过 data-grid 属性定义布局

```jsx
function MyGrid() {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef} style={{ minHeight: "400px" }}>
      {mounted && (
        <ReactGridLayout
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
        >
          <div key="a" data-grid={{ x: 0, y: 0, w: 2, h: 2, static: true }}>
            组件 A
          </div>
          <div key="b" data-grid={{ x: 2, y: 0, w: 3, h: 2, minW: 2, maxW: 4 }}>
            组件 B
          </div>
          <div key="c" data-grid={{ x: 5, y: 0, w: 2, h: 2 }}>
            组件 C
          </div>
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 4.2 宽度获取方式

#### 推荐方案：useContainerWidth Hook

```jsx
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";

function MyGrid() {
  // 推荐：使用 useContainerWidth Hook
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout width={width}>
          {/* 网格内容 */}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

#### 固定宽度方案

```jsx
// 适用于尺寸固定的场景
<ReactGridLayout width={1200}>
  {/* 网格内容 */}
</ReactGridLayout>
```

#### 传统方案：WidthProvider HOC

```jsx
import ReactGridLayout, { WidthProvider } from "react-grid-layout/legacy";

const GridLayoutWithWidth = WidthProvider(ReactGridLayout);

function MyGrid() {
  return <GridLayoutWithWidth>{/* 网格内容 */}</GridLayoutWithWidth>;
}
```

---

## 5. 响应式布局

### 5.1 Responsive 组件基础用法

```jsx
import { Responsive, useContainerWidth } from "react-grid-layout";

function MyResponsiveGrid() {
  const { width, containerRef, mounted } = useContainerWidth();

  const layouts = {
    lg: [
      { i: "a", x: 0, y: 0, w: 3, h: 2 },
      { i: "b", x: 3, y: 0, w: 3, h: 2 },
      { i: "c", x: 6, y: 0, w: 3, h: 2 },
      { i: "d", x: 9, y: 0, w: 3, h: 2 }
    ],
    md: [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 2, y: 0, w: 4, h: 2 },
      { i: "c", x: 0, y: 2, w: 3, h: 2 },
      { i: "d", x: 3, y: 2, w: 3, h: 2 }
    ],
    sm: [
      { i: "a", x: 0, y: 0, w: 3, h: 2 },
      { i: "b", x: 0, y: 2, w: 3, h: 2 },
      { i: "c", x: 0, y: 4, w: 3, h: 2 },
      { i: "d", x: 0, y: 6, w: 3, h: 2 }
    ],
    xs: [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 2, w: 2, h: 2 },
      { i: "c", x: 0, y: 4, w: 2, h: 2 },
      { i: "d", x: 0, y: 6, w: 2, h: 2 }
    ]
  };

  return (
    <div ref={containerRef} style={{ minHeight: "500px" }}>
      {mounted && (
        <Responsive
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          width={width}
        >
          <div key="a" style={{ background: "#ff6b6b" }}>桌面端 4 列</div>
          <div key="b" style={{ background: "#4ecdc4" }}>平板 3 列</div>
          <div key="c" style={{ background: "#45b7d1" }}>小屏 2 列</div>
          <div key="d" style={{ background: "#96ceb4" }}>手机 2 列</div>
        </Responsive>
      )}
    </div>
  );
}
```

### 5.2 响应式配置选项

| 属性 | 类型 | 说明 |
|------|------|------|
| `breakpoints` | `Record<B, number>` | 断点定义（默认：`{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}`） |
| `cols` | `Record<B, number>` | 每个断点的列数（默认：`{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}`） |
| `layouts` | `Record<B, Layout>` | 每个断点的布局数组 |
| `margin` | `[number, number] \| Partial<Record<B, [number, number]>>` | 间距 |
| `containerPadding` | `[number, number] \| Partial<Record<B, [number, number] \| null>>` | 内边距 |

---

## 6. 事件回调与状态管理

### 6.1 核心回调函数

```jsx
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import { useState, useCallback } from "react";

function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState(defaultLayout);
  const [draggingItem, setDraggingItem] = useState(null);

  // 布局变化时调用
  const handleLayoutChange = useCallback((newLayout) => {
    console.log("布局已更新:", newLayout);
    setLayout(newLayout);
  }, []);

  // 开始拖拽
  const handleDragStart = useCallback((layout, layoutItem, placeholderItem, event, element) => {
    console.log("开始拖拽:", layoutItem.i);
    setDraggingItem(layoutItem.i);
  }, []);

  // 拖拽中
  const handleDrag = useCallback((layout, layoutItem, layoutItemMD, layoutItemMU, placeholder, event, element) => {
    // 实时更新位置
  }, []);

  // 拖拽结束
  const handleDragStop = useCallback((layout, layoutItem, layoutItemMD, layoutItemMU, placeholder, event, element) => {
    console.log("拖拽结束:", layoutItem.i);
    setDraggingItem(null);
    // 持久化布局
  }, []);

  // 开始调整大小
  const handleResizeStart = useCallback((layout, layoutItem, placeholderItem, event, element) => {
    console.log("开始调整:", layoutItem.i);
  }, []);

  // 调整大小中
  const handleResize = useCallback((layout, layoutItem, layoutItemMD, layoutItemMU, placeholder, event, element) => {
    // 实时更新尺寸
  }, []);

  // 调整大小结束
  const handleResizeStop = useCallback((layout, layoutItem, layoutItemMD, layoutItemMU, placeholder, event, element) => {
    console.log("调整结束:", layoutItem.i, {
      width: layoutItem.w,
      height: layoutItem.h
    });
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: "400px" }}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
        >
          {/* 网格项 */}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 6.2 布局持久化

#### localStorage 持久化

```jsx
const STORAGE_KEY = "dashboard-layout";

function usePersistentLayout(defaultLayout) {
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultLayout;
    } catch {
      return defaultLayout;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  return [layout, setLayout];
}

function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = usePersistentLayout(defaultLayout);

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
          onLayoutChange={setLayout}
        >
          {/* 网格项 */}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

#### 后端持久化

```jsx
function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState(defaultLayout);
  const saveTimeoutRef = useRef(null);

  const handleLayoutChange = useCallback(async (newLayout) => {
    setLayout(newLayout);

    // 防抖保存到后端
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch("/api/layout", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ layout: newLayout })
        });
      } catch (error) {
        console.error("保存布局失败:", error);
      }
    }, 1000);
  }, []);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
          onLayoutChange={handleLayoutChange}
        >
          {/* 网格项 */}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

---

## 7. Hooks API 详解

### 7.1 useGridLayout

底层状态管理 Hook，适合需要直接控制交互状态的场景：

```typescript
const {
  layout,              // 当前布局
  setLayout,           // 直接设置布局
  dragState,           // 当前拖拽状态
  resizeState,         // 当前调整大小状态
  dropState,           // 当前拖放状态
  onDragStart,         // 开始拖拽
  onDrag,              // 更新拖拽位置
  onDragStop,          // 结束拖拽
  onResizeStart,       // 开始调整大小
  onResize,            // 更新调整大小
  onResizeStop,        // 结束调整大小
  onDropDragOver,      // 处理外部拖拽悬停
  onDropDragLeave,     // 处理外部拖拽离开
  onDrop,              // 完成外部拖放
  containerHeight,     // 容器高度（行数）
  isInteracting,       // 是否有交互进行中
  compactor            // 当前紧凑化器
} = useGridLayout({
  layout: initialLayout,
  cols: 12,
  preventCollision: false,
  onLayoutChange: (layout) => {},
  compactor: verticalCompactor
});
```

### 7.2 useResponsiveLayout

封装响应式布局逻辑的 Hook：

```typescript
const {
  layout,                      // 当前断点的布局
  layouts,                     // 所有断点的布局
  breakpoint,                  // 当前断点
  cols,                        // 当前列数
  setLayoutForBreakpoint,      // 设置特定断点的布局
  setLayouts,                  // 设置所有布局
  sortedBreakpoints            // 排序后的断点数组
} = useResponsiveLayout({
  width: containerWidth,
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  layouts: initialLayouts,
  compactor: verticalCompactor,
  onBreakpointChange: (newBreakpoint, cols) => {},
  onLayoutChange: (layout, layouts) => {},
  onWidthChange: (width, margin, cols, padding) => {}
});
```

---

## 8. 高级用法

### 8.1 拖拽手柄控制

```jsx
function CardWithDragHandle() {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          width={width}
          gridConfig={{ cols: 12, rowHeight: 100 }}
          dragConfig={{
            enabled: true,
            handle: ".drag-handle",    // 只有此元素可拖拽
            cancel: ".no-drag-area",   // 此区域不可拖拽
            threshold: 5               // 移动 5px 后开始拖拽
          }}
        >
          <div key="card" className="dashboard-card">
            <div className="card-header drag-handle">
              <span>卡片标题</span>
              <span className="drag-icon">⋮⋮</span>
            </div>
            <div className="card-content no-drag-area">
              <p>这段内容区域不可拖拽</p>
            </div>
          </div>
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 8.2 紧凑化策略

```jsx
import {
  verticalCompactor,
  horizontalCompactor,
  noCompactor,
  getCompactor,
  fastVerticalCompactor
} from "react-grid-layout";

// 垂直紧凑（默认）：元素向上移动填补空白
<ReactGridLayout compactor={verticalCompactor}>

// 水平紧凑：元素向左移动填补空白
<ReactGridLayout compactor={horizontalCompactor}>

// 无紧凑：自由定位，允许重叠
<ReactGridLayout compactor={noCompactor}>

// 自定义紧凑化（允许重叠）
<ReactGridLayout compactor={getCompactor("vertical", true, false)}>

// 快速紧凑化器（性能优化版本）
<ReactGridLayout compactor={fastVerticalCompactor}>
```

### 8.3 自定义调整手柄

```jsx
function CustomResizeHandles() {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          width={width}
          gridConfig={{ cols: 12, rowHeight: 100 }}
          resizeConfig={{
            enabled: true,
            handles: ["se", "sw", "ne", "nw", "s", "n", "e", "w"],
            handleComponent: (axis, ref) => (
              <div
                ref={ref}
                className={`custom-resize-handle resize-${axis}`}
                style={{
                  width: "20px",
                  height: "20px",
                  background: "#1890ff",
                  borderRadius: "4px"
                }}
              >
                <span style={{ color: "#fff", fontSize: "10px" }}>{axis}</span>
              </div>
            )
          }}
        >
          {/* 网格项 */}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 8.4 外部拖放支持

```jsx
function DragDropGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState(initialLayout);
  const [items, setItems] = useState(["a", "b", "c"]);

  const handleDrop = useCallback((layout, item, e) => {
    const newItem = {
      i: `item-${Date.now()}`,
      ...item
    };
    setLayout([...layout, newItem]);
    setItems([...items, newItem.i]);
  }, [layout, items]);

  return (
    <div>
      {/* 可拖放的元素列表 */}
      <div className="draggable-items">
        {["widget1", "widget2", "widget3"].map(name => (
          <div
            key={name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", name);
            }}
            className="draggable-item"
          >
            {name}
          </div>
        ))}
      </div>

      {/* 网格区域 */}
      <div ref={containerRef} style={{ minHeight: "400px" }}>
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 50 }}
            dropConfig={{
              enabled: true,
              defaultItem: { w: 2, h: 2 }
            }}
            onDrop={handleDrop}
            onDropDragOver={(e) => ({ w: 2, h: 2 })}
          >
            {items.map(i => (
              <div key={i}>{i}</div>
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
```

### 8.5 动态添加和删除元素

```jsx
function DynamicGrid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState(initialLayout);
  const [items, setItems] = useState([
    { i: "a", content: "组件 A" },
    { i: "b", content: "组件 B" }
  ]);
  const counterRef = useRef(2);

  const addItem = () => {
    const newId = `item-${counterRef.current++}`;
    const newLayoutItem = {
      i: newId,
      x: (layout.length * 2) % 12,
      y: Infinity,  // 自动放到最底部
      w: 2,
      h: 2
    };
    setLayout([...layout, newLayoutItem]);
    setItems([...items, { i: newId, content: `组件 ${newId}` }]);
  };

  const removeItem = (itemId) => {
    setLayout(layout.filter(item => item.i !== itemId));
    setItems(items.filter(item => item.i !== itemId));
  };

  return (
    <div>
      <button onClick={addItem}>添加组件</button>
      <div ref={containerRef} style={{ minHeight: "400px" }}>
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 50 }}
            onLayoutChange={setLayout}
          >
            {items.map(item => (
              <div key={item.i} style={{ position: "relative" }}>
                {item.content}
                <button
                  onClick={() => removeItem(item.i)}
                  style={{ position: "absolute", top: 5, right: 5 }}
                >
                  ×
                </button>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
```

---

## 9. 样式定制

### 9.1 自定义网格容器

```css
/* 自定义网格容器 */
.react-grid-layout {
  background: transparent;
  position: relative;
}

/* 网格项基础样式 */
.react-grid-item {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.react-grid-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 拖拽中的样式 */
.react-grid-item.react-draggable-dragging {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 100;
  opacity: 0.95;
  cursor: grabbing;
}

/* 静态项样式 */
.react-grid-item.static {
  background: #f5f5f5;
  cursor: default;
}

/* 占位符样式 */
.react-grid-item.react-grid-placeholder {
  background: #1890ff;
  opacity: 0.2;
  border-radius: 12px;
  transition-duration: 100ms;
  z-index: 2;
}
```

### 9.2 自定义调整手柄

```css
/* 默认手柄样式 */
.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

.react-resizable-handle::after {
  content: "";
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}

/* 各方向手柄样式 */
.react-resizable-handle-se {
  background: linear-gradient(135deg, transparent 50%, rgba(24, 144, 255, 0.5) 50%);
}

.react-resizable-handle-sw {
  background: linear-gradient(225deg, transparent 50%, rgba(24, 144, 255, 0.5) 50%);
  left: 0;
  right: auto;
}

.react-resizable-handle-ne {
  background: linear-gradient(315deg, transparent 50%, rgba(24, 144, 255, 0.5) 50%);
  top: 0;
  bottom: auto;
}

.react-resizable-handle-nw {
  background: linear-gradient(45deg, transparent 50%, rgba(24, 144, 255, 0.5) 50%);
  top: 0;
  left: 0;
  right: auto;
  bottom: auto;
}
```

### 9.3 拖拽手柄样式

```css
/* 拖拽手柄样式 */
.drag-handle {
  cursor: grab;
  background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
  padding: 8px 12px;
  border-bottom: 1px solid #d0d0d0;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 禁用拖拽区域 */
.no-drag-area {
  pointer-events: none;
  opacity: 0.7;
}
```

### 9.4 网格背景组件

```jsx
import { Responsive, useContainerWidth } from "react-grid-layout";
import { GridBackground } from "react-grid-layout/extras";

function Dashboard() {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef} style={{ position: "relative", minHeight: "600px" }}>
      {mounted && (
        <>
          <GridBackground
            width={width}
            cols={12}
            rowHeight={50}
            margin={[10, 10]}
            containerPadding={[10, 10]}
            color="#e8e8e8"
            borderRadius={4}
          />
          <Responsive
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            width={width}
          >
            {/* 网格项 */}
          </Responsive>
        </>
      )}
    </div>
  );
}
```

---

## 10. 常见功能实现示例

### 10.1 仪表盘布局

```jsx
function Dashboard() {
  const { width, containerRef, mounted } = useContainerWidth();

  const defaultLayout = [
    { i: "stats", x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: "chart1", x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
    { i: "chart2", x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "table", x: 0, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "activity", x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 }
  ];

  const [layout, setLayout] = useState(defaultLayout);

  const components = {
    stats: <StatsOverview />,
    chart1: <RevenueChart />,
    chart2: <CategoryChart />,
    table: <RecentOrders />,
    activity: <ActivityFeed />
  };

  return (
    <div ref={containerRef} style={{ minHeight: "800px" }}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 60 }}
          onLayoutChange={setLayout}
        >
          {layout.map(item => (
            <div key={item.i} className="dashboard-card">
              {components[item.i]}
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 10.2 表单构建器

```jsx
function FormBuilder() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [layout, setLayout] = useState(defaultFormLayout);
  const [formFields, setFormFields] = useState(formFieldDefs);

  const fieldTypes = ["text", "number", "date", "select", "checkbox", "textarea"];

  const handleDrop = useCallback((newLayout, item) => {
    const fieldType = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
    setFormFields([...formFields, {
      id: item.i,
      type: fieldType,
      label: `新字段 ${item.i}`
    }]);
  }, [formFields]);

  return (
    <div className="form-builder">
      {/* 字段工具栏 */}
      <div className="field-palette">
        {fieldTypes.map(type => (
          <div
            key={type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("fieldType", type)}
            className="field-type"
          >
            {type}
          </div>
        ))}
      </div>

      {/* 表单画布 */}
      <div ref={containerRef} style={{ minHeight: "600px" }}>
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 60 }}
            dropConfig={{ enabled: true, defaultItem: { w: 6, h: 2 } }}
            onLayoutChange={setLayout}
            onDrop={handleDrop}
          >
            {formFields.map(field => (
              <div key={field.id} className="form-field">
                <label>{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}
```

### 10.3 图片画廊

```jsx
function ImageGallery() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [images, setImages] = useState(galleryImages);

  const handleLayoutChange = useCallback((newLayout) => {
    const updatedImages = images.map((img, idx) => ({
      ...img,
      ...newLayout[idx]
    }));
    setImages(updatedImages);
  }, [images]);

  return (
    <div ref={containerRef} style={{ minHeight: "600px" }}>
      {mounted && (
        <ReactGridLayout
          layout={images}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 100 }}
          onLayoutChange={handleLayoutChange}
        >
          {images.map(img => (
            <div key={img.id} className="gallery-item">
              <img src={img.src} alt={img.alt} />
              <div className="overlay">
                <span>{img.title}</span>
              </div>
            </div>
          ))}
        </ReactGridLayout>
      )}
    </div>
  );
}
```

### 10.4 可折叠侧边栏布局

```jsx
function LayoutWithSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  // 根据侧边栏状态调整网格列数
  const effectiveWidth = sidebarCollapsed ? width - 60 : width - 240;
  const cols = sidebarCollapsed ? 12 : 10;

  return (
    <div className="layout-container">
      <aside className={sidebarCollapsed ? "collapsed" : ""}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? "展开" : "收起"}
        </button>
        <nav>{/* 导航内容 */}</nav>
      </aside>

      <main ref={containerRef} style={{ minHeight: "600px" }}>
        {mounted && (
          <ReactGridLayout
            layout={dashboardLayout}
            width={effectiveWidth}
            gridConfig={{ cols, rowHeight: 60 }}
          >
            {/* 仪表盘组件 */}
          </ReactGridLayout>
        )}
      </main>
    </div>
  );
}
```

---

## 11. 模块入口与工具函数

### 11.1 模块入口

| 入口点 | 描述 |
|--------|------|
| `react-grid-layout` | React 组件和 Hooks（v2 API） |
| `react-grid-layout/core` | 纯布局算法（框架无关） |
| `react-grid-layout/legacy` | v1 扁平 props API |
| `react-grid-layout/extras` | 可选组件如 GridBackground |

### 11.2 核心工具函数

从 `react-grid-layout/core` 导入：

```typescript
import {
  // 紧凑化函数
  verticalCompactor,
  horizontalCompactor,
  noCompactor,
  getCompactor,

  // 布局操作
  moveElement,
  cloneLayout,
  cloneLayoutItem,
  compact,

  // 碰撞检测
  collides,
  getFirstCollision,
  getStatics,

  // 验证
  validateLayout,

  // 辅助函数
  resolveCompactionCollision,
  compactItemVertical,
  compactItemHorizontal,

  // 网格计算
  calcGridCellDimensions,
  bottom
} from "react-grid-layout/core";
```

### 11.3 工具函数使用示例

```typescript
import {
  cloneLayout,
  validateLayout,
  moveElement,
  compact
} from "react-grid-layout/core";

// 克隆布局（用于撤销功能）
const clonedLayout = cloneLayout(layout);

// 验证布局有效性
const errors = validateLayout(layout, { cols: 12 });
if (errors.length > 0) {
  console.error("布局错误:", errors);
}

// 移动元素
const newLayout = moveElement({
  layout,
  item: targetItem,
  x: 5,
  y: 3,
  collisionFn: collides,
  props: { cols: 12 }
});

// 紧凑化布局
const compactedLayout = compact(layout, "vertical", { cols: 12 });
```

---

## 12. 最佳实践与性能优化

### 12.1 性能优化建议

#### 使用 useCallback 优化回调

```jsx
// 不推荐：每次渲染创建新函数
<ReactGridLayout
  onLayoutChange={(layout) => setLayout(layout)}
/>

// 推荐：使用 useCallback 缓存函数
const handleLayoutChange = useCallback((layout) => {
  setLayout(layout);
}, []);

<ReactGridLayout
  onLayoutChange={handleLayoutChange}
/>
```

#### 使用防抖保存布局

```jsx
const saveTimeoutRef = useRef(null);

const handleLayoutChange = useCallback((layout) => {
  setLayout(layout);

  // 防抖保存
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  saveTimeoutRef.current = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, 500);
}, []);
```

#### 避免不必要的重新渲染

```jsx
// 使用 React.memo 包装网格项
const GridItem = React.memo(({ children, style }) => (
  <div style={style} className="grid-item">
    {children}
  </div>
));

// 使用 useMemo 缓存布局
const memoizedLayout = useMemo(() => layout, [layout]);
```

### 12.2 常见问题处理

#### 布局重置问题

```jsx
// 问题：添加新项时布局重置
// 解决：确保 layout 和 items 同步更新
const addItem = () => {
  const newId = `item-${Date.now()}`;
  const newLayoutItem = {
    i: newId,
    x: 0,
    y: Infinity,
    w: 2,
    h: 2
  };
  // 原子性更新
  setLayout(prevLayout => {
    const newLayout = [...prevLayout, newLayoutItem];
    return compact(newLayout, "vertical", { cols: 12 });
  });
  setItems(prevItems => [...prevItems, { id: newId }]);
};
```

#### 调整大小时内容不更新

```jsx
// 监听尺寸变化的组件
function ResizeSensor({ onResize, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onResize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [onResize]);

  return <div ref={ref}>{children}</div>;
}

// 使用
function ChartWidget({ id }) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <ResizeSensor onResize={setSize}>
      <div className="widget">
        <Chart width={size.width} height={size.height} />
      </div>
    </ResizeSensor>
  );
}
```

### 12.3 无障碍支持

```jsx
// 添加键盘导航
<div
  className="react-grid-item"
  tabIndex={0}
  role="button"
  aria-label={`组件 ${item.i}，可拖拽和调整大小`}
  onKeyDown={(e) => {
    switch (e.key) {
      case "ArrowUp":
        // 向上移动
        break;
      case "ArrowDown":
        // 向下移动
        break;
      case "ArrowLeft":
        // 向左移动
        break;
      case "ArrowRight":
        // 向右移动
        break;
      case "+":
      case "=":
        // 增加高度
        break;
      case "-":
        // 减少高度
        break;
    }
  }}
>
  {/* 组件内容 */}
</div>
```

---

## 附录：默认配置值

| 属性 | 默认值 |
|------|--------|
| `gridConfig.cols` | 12 |
| `gridConfig.rowHeight` | 150 |
| `gridConfig.margin` | [10, 10] |
| `gridConfig.containerPadding` | null |
| `gridConfig.maxRows` | Infinity |
| `dragConfig.enabled` | true |
| `dragConfig.bounded` | false |
| `dragConfig.threshold` | 3 |
| `resizeConfig.enabled` | true |
| `resizeConfig.handles` | ['se'] |
| `dropConfig.enabled` | false |
| `dropConfig.defaultItem` | { w: 1, h: 1 } |
| `autoSize` | true |

---

## 参考资源

- GitHub 仓库：https://github.com/react-grid-layout/react-grid-layout
- 官方文档：https://react-grid-layout.github.io/react-grid-layout/
- 在线示例：https://codesandbox.io/examples/package/react-grid-layout

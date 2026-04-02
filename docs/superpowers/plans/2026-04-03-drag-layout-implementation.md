# 拖拽布局场景页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个可视化拖拽布局编辑器场景页面，支持从右侧侧边栏拖拽组件到画布，调整位置大小，删除和撤销操作。

**Architecture:** 使用 React Grid Layout 实现网格布局，组件分为三层：页面层（pages包）、UI组件层（ui包）、路由层（web应用）。状态管理使用 React Hooks + localStorage 持久化。

**Tech Stack:** React 19, TypeScript, Tailwind CSS, react-grid-layout, shadcn/ui

---

## 文件结构

```
packages/ui/src/components/custom/drag-layout/
├── index.ts                  # 导出
├── types.ts                  # 类型定义
├── Canvas.tsx                # 画布组件
├── ComponentSidebar.tsx      # 组件侧边栏
├── DraggableCard.tsx         # 可拖拽卡片
├── ComponentThumbnail.tsx    # 组件缩略图
└── useLayoutHistory.ts       # 撤销/重做 Hook

packages/pages/src/
├── drag-layout-page.tsx      # 主页面组件
└── index.ts                  # 新增导出

apps/web/src/app/drag-layout/
└── page.tsx                  # 路由页面
```

---

### Task 1: 安装依赖并配置样式

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: 安装 react-grid-layout 依赖**

```bash
cd d:/Work/2026/fe-base && pnpm add react-grid-layout --filter @repo/ui
```

- [ ] **Step 2: 在 globals.css 中导入 react-grid-layout 样式**

在 `apps/web/src/app/globals.css` 文件末尾添加：

```css
/* React Grid Layout Styles */
@import "react-grid-layout/css/styles.css";
@import "react-resizable/css/styles.css";
```

- [ ] **Step 3: 验证安装成功**

```bash
cd d:/Work/2026/fe-base && pnpm type-check
```

Expected: 无报错

- [ ] **Step 4: Commit**

```bash
git add packages/ui/package.json apps/web/src/app/globals.css pnpm-lock.yaml
git commit -m "feat: add react-grid-layout dependency and styles"
```

---

### Task 2: 创建类型定义文件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// packages/ui/src/components/custom/drag-layout/types.ts

import type { ReactNode } from "react"

/**
 * 布局项数据结构
 */
export interface LayoutItem {
  /** 唯一标识符 */
  i: string
  /** X 位置（列） */
  x: number
  /** Y 位置（行） */
  y: number
  /** 宽度（列数） */
  w: number
  /** 高度（行数） */
  h: number
  /** 组件类型 */
  componentType: string
  /** 最小宽度 */
  minW?: number
  /** 最大宽度 */
  maxW?: number
  /** 最小高度 */
  minH?: number
  /** 最大高度 */
  maxH?: number
  /** 是否静态（不可拖拽调整） */
  static?: boolean
}

/**
 * 可注册组件的配置
 */
export interface ComponentConfig {
  /** 组件类型标识 */
  type: string
  /** 组件显示名称 */
  name: string
  /** 组件图标 */
  icon?: ReactNode
  /** 默认尺寸 */
  defaultSize: { w: number; h: number }
  /** 最小尺寸 */
  minSize?: { w: number; h: number }
  /** 渲染函数 */
  render: (props: { width: number; height: number }) => ReactNode
}

/**
 * 组件注册表
 */
export type ComponentRegistry = Record<string, ComponentConfig>

/**
 * 布局历史记录状态
 */
export interface LayoutHistoryState {
  /** 当前布局 */
  layout: LayoutItem[]
  /** 历史记录栈 */
  history: LayoutItem[][]
  /** 当前历史位置索引 */
  historyIndex: number
}

/**
 * 画布组件 Props
 */
export interface CanvasProps {
  /** 当前布局 */
  layout: LayoutItem[]
  /** 布局变化回调 */
  onLayoutChange: (layout: LayoutItem[]) => void
  /** 组件注册表 */
  componentRegistry: ComponentRegistry
  /** 删除卡片回调 */
  onDeleteCard: (id: string) => void
}

/**
 * 组件侧边栏 Props
 */
export interface ComponentSidebarProps {
  /** 是否打开 */
  open: boolean
  /** 打开/关闭回调 */
  onOpenChange: (open: boolean) => void
  /** 组件注册表 */
  componentRegistry: ComponentRegistry
}

/**
 * 可拖拽卡片 Props
 */
export interface DraggableCardProps {
  /** 布局项数据 */
  item: LayoutItem
  /** 组件配置 */
  componentConfig: ComponentConfig
  /** 删除回调 */
  onDelete: () => void
}

/**
 * 组件缩略图 Props
 */
export interface ComponentThumbnailProps {
  /** 组件配置 */
  component: ComponentConfig
}

/**
 * 撤销/重做 Hook 返回值
 */
export interface UseLayoutHistoryReturn {
  /** 当前布局 */
  layout: LayoutItem[]
  /** 设置布局（会记录历史） */
  setLayout: (layout: LayoutItem[]) => void
  /** 撤销 */
  undo: () => void
  /** 重做 */
  redo: () => void
  /** 是否可撤销 */
  canUndo: boolean
  /** 是否可重做 */
  canRedo: boolean
  /** 清空历史 */
  clearHistory: () => void
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/types.ts
git commit -m "feat(drag-layout): add type definitions"
```

---

### Task 3: 创建撤销/重做 Hook

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/useLayoutHistory.ts`

- [ ] **Step 1: 创建 useLayoutHistory Hook**

```typescript
// packages/ui/src/components/custom/drag-layout/useLayoutHistory.ts

import { useCallback, useRef, useState } from "react"
import type { LayoutItem, UseLayoutHistoryReturn } from "./types"

const MAX_HISTORY_SIZE = 50

export function useLayoutHistory(initialLayout: LayoutItem[] = []): UseLayoutHistoryReturn {
  const [layout, setLayoutState] = useState<LayoutItem[]>(initialLayout)
  const historyRef = useRef<LayoutItem[][]>([initialLayout])
  const historyIndexRef = useRef<number>(0)

  const setLayout = useCallback((newLayout: LayoutItem[]) => {
    setLayoutState(newLayout)
    
    // 截断后续历史（撤销后再修改时丢弃重做记录）
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(newLayout)
    
    // 限制历史记录大小
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift()
    } else {
      historyIndexRef.current++
    }
    
    historyRef.current = newHistory
  }, [])

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      const prevLayout = historyRef.current[historyIndexRef.current]
      setLayoutState(prevLayout)
    }
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      const nextLayout = historyRef.current[historyIndexRef.current]
      setLayoutState(nextLayout)
    }
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current = [layout]
    historyIndexRef.current = 0
  }, [layout])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  return {
    layout,
    setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/useLayoutHistory.ts
git commit -m "feat(drag-layout): add useLayoutHistory hook for undo/redo"
```

---

### Task 4: 创建组件缩略图组件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/ComponentThumbnail.tsx`

- [ ] **Step 1: 创建 ComponentThumbnail 组件**

```typescript
// packages/ui/src/components/custom/drag-layout/ComponentThumbnail.tsx

import { Table } from "lucide-react"
import type { ComponentThumbnailProps } from "./types"

export function ComponentThumbnail({ component }: ComponentThumbnailProps) {
  return (
    <div className="group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-md active:cursor-grabbing">
      {/* 缩略图预览区域 */}
      <div className="mb-2 flex aspect-video items-center justify-center rounded bg-muted/50">
        {component.type === "table" ? (
          <div className="flex h-full w-full flex-col gap-1 p-2">
            {/* 表格缩略图模拟 */}
            <div className="h-2 w-full rounded bg-primary/20" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded bg-muted-foreground/10" />
              <div className="h-1.5 w-full rounded bg-muted-foreground/10" />
              <div className="h-1.5 w-3/4 rounded bg-muted-foreground/10" />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            {component.icon || <Table className="h-8 w-8" />}
          </div>
        )}
      </div>
      
      {/* 组件名称 */}
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">
          {component.type === "table" ? <Table className="h-4 w-4" /> : component.icon}
        </div>
        <span className="text-sm font-medium">{component.name}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/ComponentThumbnail.tsx
git commit -m "feat(drag-layout): add ComponentThumbnail component"
```

---

### Task 5: 创建可拖拽卡片组件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/DraggableCard.tsx`

- [ ] **Step 1: 创建 DraggableCard 组件**

```typescript
// packages/ui/src/components/custom/drag-layout/DraggableCard.tsx

import { GripVertical, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { DraggableCardProps } from "./types"

export function DraggableCard({ item, componentConfig, onDelete }: DraggableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* 卡片头部 - 拖拽手柄 */}
      <div className="drag-handle flex cursor-grab items-center justify-between border-b border-border bg-muted/30 px-3 py-2 active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{componentConfig.name}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="删除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 卡片内容区域 */}
      <div ref={containerRef} className="flex-1 overflow-auto p-3">
        {componentConfig.render({ width: size.width, height: size.height })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/DraggableCard.tsx
git commit -m "feat(drag-layout): add DraggableCard component"
```

---

### Task 6: 创建组件侧边栏组件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/ComponentSidebar.tsx`

- [ ] **Step 1: 创建 ComponentSidebar 组件**

```typescript
// packages/ui/src/components/custom/drag-layout/ComponentSidebar.tsx

import { X } from "lucide-react"
import type { ComponentSidebarProps } from "./types"
import { ComponentThumbnail } from "./ComponentThumbnail"

export function ComponentSidebar({ open, onOpenChange, componentRegistry }: ComponentSidebarProps) {
  const components = Object.values(componentRegistry)

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType)
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <>
      {/* 遮罩层 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 transform border-l border-border bg-background shadow-lg transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">组件库</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 组件列表 */}
        <div className="space-y-3 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground">
            拖拽组件到画布区域添加
          </p>
          {components.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
            >
              <ComponentThumbnail component={component} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/ComponentSidebar.tsx
git commit -m "feat(drag-layout): add ComponentSidebar component"
```

---

### Task 7: 创建画布组件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/Canvas.tsx`

- [ ] **Step 1: 创建 Canvas 组件**

```typescript
// packages/ui/src/components/custom/drag-layout/Canvas.tsx

import ReactGridLayout from "react-grid-layout"
import { useContainerWidth } from "react-grid-layout"
import { useCallback } from "react"
import type { CanvasProps, LayoutItem } from "./types"
import { DraggableCard } from "./DraggableCard"

export function Canvas({ layout, onLayoutChange, componentRegistry, onDeleteCard }: CanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth()

  const handleDrop = useCallback(
    (currentLayout: LayoutItem[], item: LayoutItem, e: DragEvent) => {
      const componentType = e.dataTransfer?.getData("componentType")
      if (!componentType) return

      const config = componentRegistry[componentType]
      if (!config) return

      const newItem: LayoutItem = {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w || config.defaultSize.w,
        h: item.h || config.defaultSize.h,
        componentType,
        minW: config.minSize?.w,
        minH: config.minSize?.h,
      }

      onLayoutChange([...currentLayout, newItem])
    },
    [componentRegistry, onLayoutChange]
  )

  const handleDropDragOver = useCallback(() => {
    return { w: 6, h: 4 }
  }, [])

  const handleLayoutChange = useCallback(
    (newLayout: LayoutItem[]) => {
      onLayoutChange(newLayout)
    },
    [onLayoutChange]
  )

  return (
    <div
      ref={containerRef}
      className="min-h-[600px] rounded-lg border-2 border-dashed border-border bg-muted/20"
    >
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 50 }}
          dropConfig={{
            enabled: true,
            defaultItem: { w: 6, h: 4 },
          }}
          dragConfig={{
            enabled: true,
            handle: ".drag-handle",
          }}
          onLayoutChange={handleLayoutChange}
          onDrop={handleDrop}
          onDropDragOver={handleDropDragOver}
        >
          {layout.map((item) => {
            const config = componentRegistry[item.componentType]
            if (!config) return null

            return (
              <div key={item.i}>
                <DraggableCard
                  item={item}
                  componentConfig={config}
                  onDelete={() => onDeleteCard(item.i)}
                />
              </div>
            )
          })}
        </ReactGridLayout>
      )}

      {/* 空状态提示 */}
      {layout.length === 0 && (
        <div className="flex h-[500px] flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-medium">拖拽组件到此处</p>
          <p className="text-sm">从右侧组件库中选择组件</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/Canvas.tsx
git commit -m "feat(drag-layout): add Canvas component with drag-drop support"
```

---

### Task 8: 创建导出文件

**Files:**
- Create: `packages/ui/src/components/custom/drag-layout/index.ts`

- [ ] **Step 1: 创建 index.ts 导出文件**

```typescript
// packages/ui/src/components/custom/drag-layout/index.ts

export * from "./types"
export { Canvas } from "./Canvas"
export { ComponentSidebar } from "./ComponentSidebar"
export { DraggableCard } from "./DraggableCard"
export { ComponentThumbnail } from "./ComponentThumbnail"
export { useLayoutHistory } from "./useLayoutHistory"
```

- [ ] **Step 2: 更新 packages/ui/package.json 导出配置**

在 `packages/ui/package.json` 的 `exports` 中添加：

```json
"./custom/drag-layout": "./src/components/custom/drag-layout/index.ts"
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/custom/drag-layout/index.ts packages/ui/package.json
git commit -m "feat(drag-layout): add exports configuration"
```

---

### Task 9: 创建主页面组件

**Files:**
- Modify: `packages/pages/src/drag-layout-page.tsx`
- Modify: `packages/pages/src/index.ts`

- [ ] **Step 1: 创建拖拽布局场景页面**

```typescript
// packages/pages/src/drag-layout-page.tsx

/**
 * 拖拽布局场景展示页面
 * 展示从右侧侧边栏拖拽组件到画布的功能
 */

"use client"

import { Settings, Undo2, Redo2, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  Canvas,
  ComponentSidebar,
  useLayoutHistory,
  type ComponentRegistry,
  type LayoutItem,
} from "@repo/ui/custom/drag-layout"
import { DataTable, type ColumnConfig } from "@repo/ui/custom/data-table"

// 示例表格数据
const sampleTableData = [
  { id: "1", name: "张三", email: "zhangsan@example.com", status: "活跃" },
  { id: "2", name: "李四", email: "lisi@example.com", status: "离线" },
  { id: "3", name: "王五", email: "wangwu@example.com", status: "活跃" },
  { id: "4", name: "赵六", email: "zhaoliu@example.com", status: "离线" },
  { id: "5", name: "孙七", email: "sunqi@example.com", status: "活跃" },
]

const sampleTableColumns: ColumnConfig[] = [
  { id: "name", header: "姓名", accessor: "name" },
  { id: "email", header: "邮箱", accessor: "email" },
  { id: "status", header: "状态", accessor: "status" },
]

// 组件注册表配置
const componentRegistry: ComponentRegistry = {
  table: {
    type: "table",
    name: "数据表格",
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    render: ({ width, height }) => {
      // 根据 height 计算显示的行数
      const visibleRows = Math.max(3, Math.floor(height / 50))
      return (
        <div style={{ width, height: "100%" }} className="overflow-auto">
          <DataTable
            data={sampleTableData.slice(0, visibleRows)}
            columns={sampleTableColumns}
            pagination={{ show: false }}
          />
        </div>
      )
    },
  },
}

// localStorage key
const STORAGE_KEY = "drag-layout-v1"

/**
 * 拖拽布局场景展示页面
 */
export function DragLayoutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 从 localStorage 加载初始布局
  const getInitialLayout = (): LayoutItem[] => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const { layout, setLayout, undo, redo, canUndo, canRedo, clearHistory } =
    useLayoutHistory(getInitialLayout())

  // 持久化布局到 localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    }, 500)
    return () => clearTimeout(timer)
  }, [layout])

  // 删除卡片
  const handleDeleteCard = useCallback(
    (id: string) => {
      setLayout(layout.filter((item) => item.i !== id))
    },
    [layout, setLayout]
  )

  // 重置布局
  const handleReset = useCallback(() => {
    setLayout([])
    localStorage.removeItem(STORAGE_KEY)
  }, [setLayout])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  return (
    <div className="relative flex h-screen flex-col">
      {/* 头部工具栏 */}
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">拖拽布局场景</h1>
          <p className="text-sm text-muted-foreground">
            从右侧组件库拖拽组件到画布区域
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 撤销/重做按钮 */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="重置布局"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* 设置按钮 */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="ml-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Settings className="h-5 w-5" />
            <span>组件库</span>
          </button>
        </div>
      </header>

      {/* 画布区域 */}
      <main className="flex-1 overflow-auto p-6">
        <Canvas
          layout={layout}
          onLayoutChange={setLayout}
          componentRegistry={componentRegistry}
          onDeleteCard={handleDeleteCard}
        />
      </main>

      {/* 右侧侧边栏 */}
      <ComponentSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        componentRegistry={componentRegistry}
      />
    </div>
  )
}
```

- [ ] **Step 2: 更新 packages/pages/src/index.ts 导出**

在文件末尾添加：

```typescript
export { DragLayoutPage } from "./drag-layout-page"
```

- [ ] **Step 3: Commit**

```bash
git add packages/pages/src/drag-layout-page.tsx packages/pages/src/index.ts
git commit -m "feat(pages): add DragLayoutPage component"
```

---

### Task 10: 创建路由页面

**Files:**
- Create: `apps/web/src/app/drag-layout/page.tsx`

- [ ] **Step 1: 创建路由页面**

```typescript
// apps/web/src/app/drag-layout/page.tsx

import { DragLayoutPage } from "@repo/pages"

export default function Page() {
  return <DragLayoutPage />
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/drag-layout/page.tsx
git commit -m "feat(web): add drag-layout route page"
```

---

### Task 11: 验证功能并修复问题

**Files:**
- All modified files

- [ ] **Step 1: 运行类型检查**

```bash
cd d:/Work/2026/fe-base && pnpm type-check
```

Expected: 无错误

- [ ] **Step 2: 启动开发服务器验证**

```bash
cd d:/Work/2026/fe-base && pnpm dev:web
```

Expected: 服务启动成功，访问 http://localhost:3000/drag-layout 可正常显示页面

- [ ] **Step 3: 功能验证清单**

手动测试以下功能：
1. [ ] 点击"组件库"按钮，右侧侧边栏滑出
2. [ ] 侧边栏显示"数据表格"组件缩略图
3. [ ] 拖拽表格组件到画布，卡片正确添加
4. [ ] 拖拽卡片可改变位置
5. [ ] 拖拽卡片右下角可调整大小
6. [ ] 点击卡片头部删除按钮可删除
7. [ ] 点击撤销按钮可撤销操作
8. [ ] 点击重做按钮可重做操作
9. [ ] 刷新页面后布局保持

- [ ] **Step 4: 修复任何问题**

如发现问题，立即修复并提交。

---

### Task 12: 更新首页导航（可选）

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: 添加拖拽布局场景入口**

```typescript
// apps/web/src/app/page.tsx

import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">场景演示</p>
      <div className="flex gap-4">
        <Link
          href="/drag-layout"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          拖拽布局场景
        </Link>
        <Link
          href="/table-form-demo"
          className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          表格表单联动
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(web): add navigation links on homepage"
```

---

## 完成确认

完成后运行以下命令验证：

```bash
# 类型检查
pnpm type-check

# 启动开发服务器
pnpm dev:web
```

访问 http://localhost:3000/drag-layout 验证所有功能正常。

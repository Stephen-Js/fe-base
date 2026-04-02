// packages/ui/src/components/custom/drag-layout/types.ts

import type { ReactNode } from 'react'

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
  /** 组件注册表 */
  componentRegistry: ComponentRegistry
  /** 是否折叠 */
  collapsed?: boolean
  /** 折叠状态变化回调 */
  onCollapsedChange?: (collapsed: boolean) => void
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

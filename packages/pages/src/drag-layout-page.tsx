/**
 * 拖拽布局场景展示页面
 * 展示从右侧侧边栏拖拽组件到画布的功能
 */

'use client'

import { type ColumnConfig, DataTable } from '@repo/ui/custom/data-table'
import {
  Canvas,
  type ComponentRegistry,
  ComponentSidebar,
  type LayoutItem,
  useLayoutHistory,
} from '@repo/ui/custom/drag-layout'
import { ArrowLeft, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// 示例表格数据
const sampleTableData = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: '活跃' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: '离线' },
  { id: '3', name: '王五', email: 'wangwu@example.com', status: '活跃' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', status: '离线' },
  { id: '5', name: '孙七', email: 'sunqi@example.com', status: '活跃' },
]

const sampleTableColumns: ColumnConfig[] = [
  { id: 'name', header: '姓名', accessor: 'name' },
  { id: 'email', header: '邮箱', accessor: 'email' },
  { id: 'status', header: '状态', accessor: 'status' },
]

// 组件注册表配置
const componentRegistry: ComponentRegistry = {
  table: {
    type: 'table',
    name: '数据表格',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    render: ({ width, height }) => {
      // 根据 height 计算显示的行数
      const visibleRows = Math.max(3, Math.floor(height / 50))
      return (
        <div style={{ width, height: '100%' }} className="overflow-auto">
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
const STORAGE_KEY = 'drag-layout-v1'

/**
 * 拖拽布局场景展示页面
 */
export function DragLayoutPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 从 localStorage 加载初始布局
  const getInitialLayout = (): LayoutItem[] => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  const { layout, setLayout, undo, redo, canUndo, canRedo } = useLayoutHistory(getInitialLayout())

  // 调试：追踪 layout 变化
  useEffect(() => {
    console.log('layout changed:', layout)
  }, [layout])

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* 头部工具栏 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回</span>
          </a>
          <h1 className="text-xl font-bold">拖拽布局场景</h1>
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
        </div>
      </header>

      {/* 主内容区域 - 画布 + 右侧组件库 */}
      <div 
        className="flex flex-1 overflow-hidden"
        onDragOver={(e) => {
          console.log('Main area onDragOver', e.target)
        }}
      >
        {/* 画布区域 */}
        <main 
          className="flex-1 overflow-auto p-6"
          onDragOver={(e) => {
            console.log('main onDragOver', e.target)
          }}
        >
          <Canvas
            layout={layout}
            onLayoutChange={setLayout}
            componentRegistry={componentRegistry}
            onDeleteCard={handleDeleteCard}
          />
        </main>

        {/* 右侧组件库侧边栏 */}
        <ComponentSidebar
          componentRegistry={componentRegistry}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>
    </div>
  )
}

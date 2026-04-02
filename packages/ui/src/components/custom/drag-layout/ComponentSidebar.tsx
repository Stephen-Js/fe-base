// packages/ui/src/components/custom/drag-layout/ComponentSidebar.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ComponentThumbnail } from './ComponentThumbnail'
import type { ComponentSidebarProps } from './types'

export function ComponentSidebar({
  componentRegistry,
  collapsed = false,
  onCollapsedChange,
}: ComponentSidebarProps) {
  const components = Object.values(componentRegistry)

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    console.log('handleDragStart called', componentType)
    e.dataTransfer.setData('componentType', componentType)
    e.dataTransfer.effectAllowed = 'copy'
    console.log('dataTransfer data set:', e.dataTransfer.getData('componentType'))
  }

  const width = collapsed ? '64px' : '280px'

  return (
    <div
      className="flex h-full flex-col border-l border-border bg-background transition-all duration-300"
      style={{ width, minWidth: width }}
    >
      {/* 头部 */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && <h2 className="font-semibold">组件库</h2>}
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={collapsed ? '展开' : '折叠'}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* 组件列表 */}
      {!collapsed && (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground">拖拽组件到画布区域添加</p>
          {components.map((component) => (
            <button
              key={component.type}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
              className="w-full text-left"
            >
              <ComponentThumbnail component={component} />
            </button>
          ))}
        </div>
      )}

      {/* 折叠状态下的图标提示 */}
      {collapsed && (
        <div className="flex flex-1 flex-col items-center gap-2 py-4">
          <span className="text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl' }}>
            组件库
          </span>
        </div>
      )}
    </div>
  )
}

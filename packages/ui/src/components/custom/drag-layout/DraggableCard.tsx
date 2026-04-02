// packages/ui/src/components/custom/drag-layout/DraggableCard.tsx

import { GripVertical, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DraggableCardProps } from './types'

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

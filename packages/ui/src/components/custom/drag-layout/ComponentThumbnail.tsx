// packages/ui/src/components/custom/drag-layout/ComponentThumbnail.tsx

import { Table } from 'lucide-react'
import type { ComponentThumbnailProps } from './types'

export function ComponentThumbnail({ component }: ComponentThumbnailProps) {
  return (
    <div className="group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-md active:cursor-grabbing">
      {/* 缩略图预览区域 */}
      <div className="mb-2 flex aspect-video items-center justify-center rounded bg-muted/50">
        {component.type === 'table' ? (
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
          {component.type === 'table' ? <Table className="h-4 w-4" /> : component.icon}
        </div>
        <span className="text-sm font-medium">{component.name}</span>
      </div>
    </div>
  )
}

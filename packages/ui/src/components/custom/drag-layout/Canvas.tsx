// packages/ui/src/components/custom/drag-layout/Canvas.tsx

import { useCallback } from 'react'
import ReactGridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'
import { DraggableCard } from './DraggableCard'
import type { CanvasProps, LayoutItem } from './types'

export function Canvas({ layout, onLayoutChange, componentRegistry, onDeleteCard }: CanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth()

  const handleDrop = useCallback(
    (currentLayout: Layout, item: Layout[number] | undefined, e: Event) => {
      const dragEvent = e as unknown as DragEvent
      const componentType = dragEvent.dataTransfer?.getData('componentType')
      if (!componentType || !item) return

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

      onLayoutChange([...currentLayout, newItem] as LayoutItem[])
    },
    [componentRegistry, onLayoutChange]
  )

  const handleDropDragOver = useCallback(() => {
    return { w: 6, h: 4 }
  }, [])

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      onLayoutChange([...newLayout] as LayoutItem[])
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
            handle: '.drag-handle',
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

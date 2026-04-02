// packages/ui/src/components/custom/drag-layout/Canvas.tsx

import { useCallback, useRef } from 'react'
import ReactGridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'
import { DraggableCard } from './DraggableCard'
import type { CanvasProps, LayoutItem } from './types'

export function Canvas({ layout, onLayoutChange, componentRegistry, onDeleteCard }: CanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth()

  // 追踪正在处理的 drop 操作
  const isDroppingRef = useRef(false)

  const handleDrop = useCallback(
    (currentLayout: Layout, item: Layout[number] | undefined, e: Event) => {
      const dragEvent = e as unknown as DragEvent
      const componentType = dragEvent.dataTransfer?.getData('componentType')
      if (!componentType || !item) return

      const config = componentRegistry[componentType]
      if (!config) return

      const newItem: LayoutItem = {
        i: `item-${Date.now()}`,
        x: item.x,
        y: item.y,
        w: item.w ?? config.defaultSize.w,
        h: item.h ?? config.defaultSize.h,
        componentType,
        minW: config.minSize?.w,
        minH: config.minSize?.h,
      }

      // 设置 ref 标记正在处理 drop
      isDroppingRef.current = true

      // 延迟重置，确保所有 handleLayoutChange 调用都能被跳过
      setTimeout(() => {
        isDroppingRef.current = false
      }, 100)

      onLayoutChange([newItem] as LayoutItem[])
    },
    [componentRegistry, onLayoutChange]
  )

  const handleDropDragOver = useCallback((e: React.DragEvent) => {
    e.dataTransfer.dropEffect = 'copy'
    return { w: 6, h: 4 }
  }, [])

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      // 如果正在处理 drop，跳过
      if (isDroppingRef.current) return

      // 过滤掉 dropping placeholder
      const cleanLayout = newLayout.filter((l) => !l.i.startsWith('__dropping'))

      // 忽略空布局更新（可能是内部清理 placeholder）
      if (cleanLayout.length === 0) return

      // 保留原有的 componentType（ReactGridLayout 的布局变化不包含此字段）
      const mergedLayout = cleanLayout.map((item) => {
        const existingItem = layout.find((l) => l.i === item.i)
        if (existingItem) {
          return { ...item, componentType: existingItem.componentType }
        }
        return item as LayoutItem
      })

      onLayoutChange(mergedLayout as LayoutItem[])
    },
    [layout, onLayoutChange]
  )

  return (
    <div
      ref={containerRef}
      className="relative min-h-[600px] rounded-lg border-2 border-dashed border-border bg-muted/20"
    >
      {/* 空状态提示 - 放在底层，pointer-events-none 让事件穿透 */}
      {layout.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg font-medium">拖拽组件到此处</p>
          <p className="text-sm">从右侧组件库中选择组件</p>
        </div>
      )}

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
          autoSize={false}
          style={{ minHeight: 500 }}
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
    </div>
  )
}

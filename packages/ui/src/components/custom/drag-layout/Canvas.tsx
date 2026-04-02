// packages/ui/src/components/custom/drag-layout/Canvas.tsx

import { useCallback, useRef } from 'react'
import ReactGridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'
import { DraggableCard } from './DraggableCard'
import type { CanvasProps, LayoutItem } from './types'

export function Canvas({ layout, onLayoutChange, componentRegistry, onDeleteCard }: CanvasProps) {
  const { width, containerRef, mounted } = useContainerWidth()
  
  // 追踪正在处理的 drop 操作
  const isDroppingRef = useRef(false)
  const droppedItemRef = useRef<LayoutItem | null>(null)

  const handleDrop = useCallback(
    (currentLayout: Layout, item: Layout[number] | undefined, e: Event) => {
      console.log('=== handleDrop called ===', { currentLayout, item, e })
      const dragEvent = e as unknown as DragEvent
      const componentType = dragEvent.dataTransfer?.getData('componentType')
      console.log('componentType from dataTransfer:', componentType)
      if (!componentType || !item) {
        console.log('Drop rejected: no componentType or item', { componentType, item })
        return
      }

      const config = componentRegistry[componentType]
      if (!config) {
        console.log('Drop rejected: no config for', componentType)
        return
      }

      // 生成新的唯一 ID
      const newId = `item-${Date.now()}`
      const newItem: LayoutItem = {
        i: newId,
        x: item.x,
        y: item.y,
        w: item.w ?? config.defaultSize.w,
        h: item.h ?? config.defaultSize.h,
        componentType,
        minW: config.minSize?.w,
        minH: config.minSize?.h,
      }

      console.log('New item created:', newItem)
      
      // 设置 ref 标记正在处理 drop
      isDroppingRef.current = true
      droppedItemRef.current = newItem
      
      // 延迟重置 isDroppingRef，确保所有 handleLayoutChange 调用都能被跳过
      setTimeout(() => {
        isDroppingRef.current = false
      }, 100)
      
      // 直接更新布局
      onLayoutChange([newItem] as LayoutItem[])
    },
    [componentRegistry, onLayoutChange]
  )

  const handleDropDragOver = useCallback((e: React.DragEvent) => {
    console.log('handleDropDragOver called', e)
    // 设置 dropEffect 以匹配 effectAllowed = 'copy'
    e.dataTransfer.dropEffect = 'copy'
    return { w: 6, h: 4 }
  }, [])

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      console.log('handleLayoutChange called, newLayout:', newLayout, 'isDropping:', isDroppingRef.current)
      
      // 如果正在处理 drop，跳过所有 handleLayoutChange
      if (isDroppingRef.current) {
        console.log('Skipping handleLayoutChange during drop')
        return
      }
      
      // 过滤掉 dropping placeholder
      const cleanLayout = newLayout.filter((l) => !l.i.startsWith('__dropping'))
      console.log('handleLayoutChange cleanLayout:', cleanLayout)
      
      // 如果结果是空数组，但有已 drop 的项，忽略这次更新
      if (cleanLayout.length === 0 && droppedItemRef.current) {
        console.log('Ignoring empty layout, keeping dropped item:', droppedItemRef.current)
        return
      }
      
      // 清除 droppedItemRef
      droppedItemRef.current = null
      
      onLayoutChange([...cleanLayout] as LayoutItem[])
    },
    [onLayoutChange]
  )

  return (
    <div
      ref={containerRef}
      className="relative min-h-[600px] rounded-lg border-2 border-dashed border-border bg-muted/20"
      onDragOver={(e) => {
        console.log('Canvas div onDragOver', e)
        e.preventDefault()
      }}
      onDrop={(e) => {
        console.log('Canvas div onDrop', e)
      }}
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

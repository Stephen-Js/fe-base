// packages/ui/src/components/custom/drag-layout/useLayoutHistory.ts

import { useCallback, useRef, useState } from 'react'
import type { LayoutItem, UseLayoutHistoryReturn } from './types'

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
      if (prevLayout) {
        setLayoutState(prevLayout)
      }
    }
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      const nextLayout = historyRef.current[historyIndexRef.current]
      if (nextLayout) {
        setLayoutState(nextLayout)
      }
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

/**
 * 表格工具栏组件
 * 包含搜索、分页、列设置等功能
 */

'use client'

import { cn } from '@repo/utils'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings2,
  X,
} from 'lucide-react'
import * as React from 'react'

import type { ColumnConfig, PaginationConfig, ToolbarConfig } from './types'

// 搜索输入框
const SearchInput: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}> = ({ value, onChange, placeholder = '搜索...', className }) => {
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, 300)
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-accent"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

// 分页组件
const Pagination: React.FC<{
  current: number
  pageSize: number
  total: number
  totalPages: number
  onChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  config?: PaginationConfig
  className?: string
}> = ({ current, pageSize, total, totalPages, onChange, onPageSizeChange, config, className }) => {
  const {
    pageSizeOptions = [10, 20, 50, 100],
    showTotal = true,
    showJumper = false,
    jumperPlaceholder = '跳至',
    prevText = '上一页',
    nextText = '下一页',
  } = config || {}

  const [jumpValue, setJumpValue] = React.useState('')

  const handleJump = () => {
    const page = parseInt(jumpValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onChange(page)
      setJumpValue('')
    }
  }

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: { id: string; type: 'page' | 'ellipsis'; value?: number }[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ id: `page-${i}`, type: 'page', value: i })
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push({ id: `page-${i}`, type: 'page', value: i })
        }
        pages.push({ id: 'ellipsis-right', type: 'ellipsis' })
        pages.push({ id: `page-${totalPages}`, type: 'page', value: totalPages })
      } else if (current >= totalPages - 3) {
        pages.push({ id: 'page-1', type: 'page', value: 1 })
        pages.push({ id: 'ellipsis-left', type: 'ellipsis' })
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push({ id: `page-${i}`, type: 'page', value: i })
        }
      } else {
        pages.push({ id: 'page-1', type: 'page', value: 1 })
        pages.push({ id: 'ellipsis-left', type: 'ellipsis' })
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push({ id: `page-${i}`, type: 'page', value: i })
        }
        pages.push({ id: 'ellipsis-right', type: 'ellipsis' })
        pages.push({ id: `page-${totalPages}`, type: 'page', value: totalPages })
      }
    }

    return pages
  }

  const startItem = (current - 1) * pageSize + 1
  const endItem = Math.min(current * pageSize, total)

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-2">
        {showTotal && <span className="text-sm text-muted-foreground">共 {total} 条</span>}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每页</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">条</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={current === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="首页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((item) =>
          item.type === 'ellipsis' ? (
            <span
              key={item.id}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.value!)}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium ring-offset-background transition-colors',
                current === item.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.value}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(totalPages)}
          disabled={current === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="末页"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>

        {showJumper && (
          <div className="ml-2 flex items-center gap-1">
            <span className="text-sm text-muted-foreground">{jumperPlaceholder}</span>
            <input
              type="number"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJump()}
              className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              min={1}
              max={totalPages}
            />
            <span className="text-sm text-muted-foreground">页</span>
            <button
              type="button"
              onClick={handleJump}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              跳转
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 列设置弹窗
const ColumnSettings: React.FC<{
  columns: ColumnConfig[]
  visibleColumns: Set<string>
  onToggleColumn: (columnId: string) => void
  className?: string
}> = ({ columns, visibleColumns, onToggleColumn, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // 点击外部关闭
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const hideableColumns = columns.filter((col) => col.hideable !== false && col.id !== 'actions')

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="列设置"
      >
        <Columns3 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-input bg-background p-2 shadow-lg">
          <div className="mb-2 border-b border-input pb-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium">列设置</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="max-h-[300px] space-y-1 overflow-y-auto">
            {hideableColumns.map((column) => (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column.id)}
                  onChange={() => onToggleColumn(column.id)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="flex-1 text-sm">{column.header}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 刷新按钮
const RefreshButton: React.FC<{
  onRefresh?: () => void
  className?: string
}> = ({ onRefresh, className }) => {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true)
      try {
        await onRefresh()
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isLoading}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
      aria-label="刷新"
    >
      <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
    </button>
  )
}

// 密度切换
const DensitySwitch: React.FC<{
  value: 'compact' | 'default' | 'comfortable'
  onChange: (value: 'compact' | 'default' | 'comfortable') => void
  className?: string
}> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const options = [
    { label: '紧凑', value: 'compact' as const },
    { label: '默认', value: 'default' as const },
    { label: '舒适', value: 'comfortable' as const },
  ]

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Settings2 className="h-4 w-4" />
        <span>{options.find((o) => o.value === value)?.label}</span>
        <ChevronLeft className={cn('h-3 w-3 rotate-[-90deg]', isOpen && 'rotate-90')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-input bg-background p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded px-3 py-1.5 text-sm transition-colors',
                value === option.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 表格工具栏
export const TableToolbar: React.FC<{
  config?: ToolbarConfig
  columns: ColumnConfig[]
  visibleColumns: Set<string>
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleColumn: (columnId: string) => void
  onRefresh?: () => void
  density?: 'compact' | 'default' | 'comfortable'
  onDensityChange?: (value: 'compact' | 'default' | 'comfortable') => void
  selectedCount?: number
  onClearSelection?: () => void
  className?: string
}> = ({
  config,
  columns,
  visibleColumns,
  searchQuery,
  onSearchChange,
  onToggleColumn,
  onRefresh,
  density = 'default',
  onDensityChange,
  selectedCount = 0,
  onClearSelection,
  className,
}) => {
  const { show = true, search, columnSettings, refresh, density: densityConfig } = config || {}

  if (!show) return null

  return (
    <div
      className={cn('flex items-center justify-between gap-4 border-b border-input p-4', className)}
    >
      <div className="flex items-center gap-2">
        {/* 左侧插槽 */}
        {config?.leftSlot}

        {/* 搜索框 */}
        {search?.show !== false && (
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={search?.placeholder || '搜索...'}
            className="w-64"
          />
        )}

        {/* 选中操作 */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5">
            <span className="text-sm font-medium">已选择 {selectedCount} 项</span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                清除选择
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 右侧插槽 */}
        {config?.rightSlot}

        {/* 密度切换 */}
        {densityConfig?.show !== false && onDensityChange && (
          <DensitySwitch value={density} onChange={onDensityChange} />
        )}

        {/* 刷新按钮 */}
        {refresh?.show !== false && <RefreshButton onRefresh={refresh?.onRefresh || onRefresh} />}

        {/* 列设置 */}
        {columnSettings?.show !== false && (
          <ColumnSettings
            columns={columns}
            visibleColumns={visibleColumns}
            onToggleColumn={onToggleColumn}
          />
        )}
      </div>
    </div>
  )
}

// 表格分页栏
export const TablePagination: React.FC<{
  config?: PaginationConfig
  current: number
  pageSize: number
  total: number
  totalPages: number
  onChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  className?: string
}> = ({ config, current, pageSize, total, totalPages, onChange, onPageSizeChange, className }) => {
  if (config?.show === false) return null

  return (
    <div className={cn('border-t border-input p-4', className)}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onChange={onChange}
        onPageSizeChange={onPageSizeChange}
        config={config}
      />
    </div>
  )
}

// 加载骨架屏
export const TableSkeleton: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className }) => {
  // Generate stable keys for skeleton elements
  const skeletonRows = React.useMemo(() => {
    return Array.from({ length: rows }, (_, rowIdx) => ({
      id: `row-${rowIdx}`,
      cells: Array.from({ length: columns }, (_, colIdx) => `cell-${rowIdx}-${colIdx}`),
    }))
  }, [rows, columns])

  return (
    <div className={cn('space-y-3 p-4', className)}>
      {skeletonRows.map((row) => (
        <div key={row.id} className="flex items-center gap-4">
          {row.cells.map((cellId) => (
            <div key={cellId} className="h-8 flex-1 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ))}
    </div>
  )
}

// 空数据展示
export const TableEmpty: React.FC<{
  text?: string
  className?: string
}> = ({ text = '暂无数据', className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-muted p-4">
        <MoreHorizontal className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export { SearchInput, Pagination, ColumnSettings, RefreshButton, DensitySwitch }

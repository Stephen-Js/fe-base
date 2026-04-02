/**
 * DataTable - 通用表格组件
 * 支持 JSON 配置化表格字段
 */

'use client'

import { cn } from '@repo/utils'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { ActionButton as ActionButtonComponent, Cell } from './cell-renderer'
import { TableEmpty, TablePagination, TableSkeleton, TableToolbar } from './toolbar'
import type { ActionsConfig, CellValue, ColumnConfig, RowData, SortDirection } from './types'
import { filterData, getNestedValue, paginateData, searchData, sortData } from './utils'

// 表格组件 Props 接口
export interface DataTableProps<T extends RowData = RowData> {
  /** 表格数据 */
  data: T[]
  /** 列配置 */
  columns: ColumnConfig[]
  /** 操作列配置 */
  actions?: ActionsConfig
  /** 表格 className */
  className?: string
  /** 是否显示表头 */
  showHeader?: boolean
  /** 斑马纹 */
  striped?: boolean
  /** 边框 */
  bordered?: boolean
  /** 紧凑模式 */
  compact?: boolean
  /** 空数据文本 */
  emptyText?: string
  /** 加载状态 */
  loading?: boolean
  /** 骨架行数 */
  skeletonRows?: number
  /** 选中模式 */
  selectable?: 'none' | 'single' | 'multiple'
  /** 默认选中行 */
  defaultSelectedRows?: number[]
  /** 行点击事件 */
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void
  /** 行双击事件 */
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void
  /** 行类名 */
  rowClassName?: (row: T, rowIndex: number) => string
  /** 单元格类名 */
  cellClassName?: (value: CellValue, row: T, column: ColumnConfig, rowIndex: number) => string
  /** 分页配置 */
  pagination?: {
    show?: boolean
    pageSizeOptions?: number[]
    defaultPageSize?: number
    showTotal?: boolean
    showJumper?: boolean
  }
  /** 工具栏配置 */
  toolbar?: {
    show?: boolean
    search?: {
      show?: boolean
      placeholder?: string
      fields?: string[]
    }
    columnSettings?: { show?: boolean }
    refresh?: { show?: boolean; onRefresh?: () => void }
    density?: { show?: boolean }
  }
}

// 默认配置
const defaultPaginationConfig = {
  show: true,
  pageSizeOptions: [10, 20, 50, 100],
  defaultPageSize: 20,
  showTotal: true,
  showJumper: true,
}

const defaultToolbarConfig = {
  show: true,
  search: { show: true, placeholder: '搜索...', fields: undefined },
  columnSettings: { show: true },
  refresh: { show: true },
  density: { show: true },
}

// 获取对齐样式
function getAlignmentClass(align?: 'left' | 'center' | 'right' | 'start' | 'end'): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
    case 'end':
      return 'text-right'
    case 'start':
    default:
      return 'text-left'
  }
}

// 获取固定列样式
function getFixedColumnClass(fixed?: 'left' | 'right'): string {
  switch (fixed) {
    case 'left':
      return 'sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]'
    case 'right':
      return 'sticky right-0 z-10 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]'
    default:
      return ''
  }
}

// 表头单元格
const TableHeaderCell: React.FC<{
  column: ColumnConfig
  isSorted?: SortDirection
  onSort?: (columnId: string) => void
}> = ({ column, isSorted, onSort }) => {
  const canSort = column.sortable !== false

  const handleSort = () => {
    if (canSort) {
      onSort?.(column.id)
    }
  }

  return (
    <th
      className={cn(
        'border-b border-input bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground',
        getAlignmentClass(column.align),
        getFixedColumnClass(column.fixed),
        canSort && 'cursor-pointer select-none hover:bg-muted'
      )}
      style={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
      onClick={handleSort}
    >
      <div className="flex items-center gap-1">
        <span className="flex-1">{column.header}</span>
        {canSort && (
          <span className="ml-1">
            {isSorted === 'asc' ? (
              <ArrowUp className="h-4 w-4 text-primary" />
            ) : isSorted === 'desc' ? (
              <ArrowDown className="h-4 w-4 text-primary" />
            ) : (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
            )}
          </span>
        )}
        {column.tooltip && (
          <span title={column.tooltip} className="ml-1 cursor-help text-muted-foreground">
            ⓘ
          </span>
        )}
      </div>
    </th>
  )
}

// 操作列单元格
const ActionsCell: React.FC<{
  row: RowData
  rowIndex: number
  config: ActionsConfig
}> = ({ row, rowIndex, config }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

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

  const visibleButtons = config.buttons.filter((btn) => !btn.showWhen || btn.showWhen(row))

  if (config.layout === 'dropdown') {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-input bg-background p-1 shadow-lg">
            {visibleButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  btn.onClick?.(row, rowIndex)
                  setIsOpen(false)
                }}
                disabled={btn.disabledWhen?.(row)}
                className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {visibleButtons.map((btn) => (
        <ActionButtonComponent
          key={btn.id}
          label={btn.label}
          icon={btn.icon}
          variant={btn.variant}
          size={btn.size}
          className={btn.className}
          onClick={() => btn.onClick?.(row, rowIndex)}
          disabled={btn.disabledWhen?.(row)}
        />
      ))}
    </div>
  )
}

// 复选框组件
const Checkbox: React.FC<{
  checked: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
}> = ({ checked, indeterminate, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) {
          el.indeterminate = indeterminate || false
        }
      }}
      onChange={(e) => onChange?.(e.target.checked)}
      className="h-4 w-4 rounded border-input accent-primary"
    />
  )
}

// 选中状态
interface SelectionState {
  selectedRows: Set<number>
  isAllSelected: boolean
  isIndeterminate: boolean
}

/**
 * DataTable 组件
 */
export function DataTable<T extends RowData = RowData>({
  data,
  columns,
  actions,
  className,
  showHeader = true,
  striped = false,
  bordered = false,
  compact = false,
  emptyText = '暂无数据',
  loading = false,
  skeletonRows = 5,
  selectable = 'none',
  defaultSelectedRows = [],
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  cellClassName,
  pagination,
  toolbar,
}: DataTableProps<T>) {
  // 合并配置
  const paginationConfig = { ...defaultPaginationConfig, ...pagination }
  const toolbarConfig = { ...defaultToolbarConfig, ...toolbar }

  // 内部状态
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(() => {
    const defaultCols = new Set<string>(
      columns.filter((col) => !col.defaultHidden && col.id !== 'actions').map((col) => col.id)
    )
    if (actions) {
      defaultCols.add(actions.id || 'actions')
    }
    return defaultCols
  })

  const [sortState, setSortState] = React.useState<{
    columnId: string | null
    direction: SortDirection | null
  }>({ columnId: null, direction: null })

  const [searchQuery, setSearchQuery] = React.useState('')
  const [paginationState, setPaginationState] = React.useState({
    page: 1,
    pageSize: paginationConfig.defaultPageSize || 20,
  })
  const [selection, setSelection] = React.useState<SelectionState>({
    selectedRows: new Set(defaultSelectedRows),
    isAllSelected: false,
    isIndeterminate: false,
  })

  // 计算处理后的数据
  const processedData = React.useMemo(() => {
    let result = [...data]

    // 搜索
    if (searchQuery) {
      const searchableColumns = columns.filter((col) => col.filterable !== false)
      result = searchData(result, searchQuery, searchableColumns, toolbarConfig.search?.fields)
    }

    // 排序
    if (sortState.columnId && sortState.direction) {
      const sortColumn = columns.find((col) => col.id === sortState.columnId)
      if (sortColumn) {
        result = sortData(result, sortColumn, sortState.direction)
      }
    }

    return result
  }, [data, searchQuery, sortState, columns, toolbarConfig.search?.fields])

  // 分页数据
  const paginatedData = React.useMemo(() => {
    if (!paginationConfig.show) {
      return {
        data: processedData,
        total: processedData.length,
        page: 1,
        pageSize: processedData.length,
        totalPages: 1,
      }
    }

    return paginateData(processedData, paginationState.page, paginationState.pageSize)
  }, [processedData, paginationState, paginationConfig.show])

  // 全选状态更新
  React.useEffect(() => {
    if (selectable === 'multiple') {
      const selectedCount = selection.selectedRows.size
      setSelection((prev) => ({
        ...prev,
        isAllSelected: selectedCount > 0 && selectedCount === paginatedData.data.length,
        isIndeterminate: selectedCount > 0 && selectedCount < paginatedData.data.length,
      }))
    }
  }, [selection.selectedRows, paginatedData.data.length, selectable])

  // 操作方法
  const handleSort = (columnId: string) => {
    setSortState((prev) => {
      if (prev.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { columnId, direction: 'desc' }
      }
      return { columnId: null, direction: null }
    })
  }

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) {
        next.delete(columnId)
      } else {
        next.add(columnId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selection.isAllSelected) {
      setSelection({ selectedRows: new Set(), isAllSelected: false, isIndeterminate: false })
    } else {
      const allIndexes = new Set(paginatedData.data.map((_, i) => i))
      setSelection({ selectedRows: allIndexes, isAllSelected: true, isIndeterminate: false })
    }
  }

  const handleSelectRow = (rowIndex: number) => {
    setSelection((prev) => {
      const next = new Set(prev.selectedRows)
      if (next.has(rowIndex)) {
        next.delete(rowIndex)
      } else {
        next.add(rowIndex)
      }
      return {
        selectedRows: next,
        isAllSelected: false,
        isIndeterminate: next.size > 0,
      }
    })
  }

  const handleClearSelection = () => {
    setSelection({ selectedRows: new Set(), isAllSelected: false, isIndeterminate: false })
  }

  const handleRowClick = (row: T, rowIndex: number, event: React.MouseEvent) => {
    onRowClick?.(row, rowIndex, event)

    if (selectable === 'single') {
      setSelection((prev) => ({
        ...prev,
        selectedRows: new Set([rowIndex]),
        isAllSelected: false,
        isIndeterminate: false,
      }))
    } else if (selectable === 'multiple') {
      handleSelectRow(rowIndex)
    }
  }

  // 准备所有列（包括操作列）
  const allColumns = React.useMemo(() => {
    const result = [...columns]

    if (actions) {
      result.push({
        id: actions.id || 'actions',
        header: actions.header || '操作',
        accessor: 'actions',
        width: actions.width,
        align: actions.align || 'center',
        fixed: actions.fixed,
        sortable: false,
        filterable: false,
      } as ColumnConfig)
    }

    return result
  }, [columns, actions])

  // 渲染表头
  const renderHeader = () => {
    const visibleCols = allColumns
      .filter((col) => visibleColumns.has(col.id))
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    return (
      <thead>
        <tr>
          {selectable !== 'none' && (
            <th className="w-12 border-b border-input bg-muted/50 px-4 py-3">
              <Checkbox
                checked={selection.isAllSelected}
                indeterminate={selection.isIndeterminate}
                onChange={handleSelectAll}
              />
            </th>
          )}
          {visibleCols.map((column) => (
            <React.Fragment key={column.id}>
              {column.accessor === 'actions' && actions ? (
                <th
                  className={cn(
                    'border-b border-input bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground',
                    getFixedColumnClass(column.fixed)
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{column.header}</span>
                  </div>
                </th>
              ) : (
                <TableHeaderCell
                  column={column}
                  isSorted={
                    sortState.columnId === column.id ? sortState.direction || undefined : undefined
                  }
                  onSort={handleSort}
                />
              )}
            </React.Fragment>
          ))}
        </tr>
      </thead>
    )
  }

  // 渲染操作列单元格
  const renderActionsCell = (row: T, rowIndex: number) => {
    if (!actions) return null

    return (
      <td
        className={cn(
          'border-b border-input px-4 py-3',
          getAlignmentClass(actions.align || 'center'),
          getFixedColumnClass(actions.fixed)
        )}
      >
        <ActionsCell row={row} rowIndex={rowIndex} config={actions} />
      </td>
    )
  }

  // 渲染行
  const renderRows = () => {
    return paginatedData.data.map((row, rowIndex) => {
      const originalIndex = (paginationState.page - 1) * paginationState.pageSize + rowIndex
      const isSelected = selection.selectedRows.has(originalIndex)
      const isEven = rowIndex % 2 === 0

      return (
        <tr
          key={`row-${originalIndex}`}
          className={cn(
            'transition-colors',
            striped && isEven && 'bg-muted/50',
            isSelected && 'bg-primary/10',
            onRowClick && 'cursor-pointer hover:bg-accent/50',
            rowClassName?.(row, originalIndex)
          )}
          onClick={(e) => handleRowClick(row, originalIndex, e)}
          onDoubleClick={(e) => onRowDoubleClick?.(row, originalIndex, e)}
        >
          {selectable !== 'none' && (
            <td className="w-12 border-b border-input px-4">
              <Checkbox checked={isSelected} onChange={() => handleSelectRow(originalIndex)} />
            </td>
          )}

          {allColumns
            .filter((col) => visibleColumns.has(col.id))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((column) => {
              if (column.accessor === 'actions' && actions) {
                return renderActionsCell(row, originalIndex)
              }

              const value = getNestedValue(row, column.accessor)

              return (
                <td
                  key={column.id}
                  className={cn(
                    'whitespace-nowrap border-b border-input px-4 py-3',
                    compact ? 'py-1.5' : 'py-3',
                    getAlignmentClass(column.align),
                    getFixedColumnClass(column.fixed),
                    cellClassName?.(value, row, column, originalIndex)
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.render ? (
                    column.render(value, row, originalIndex)
                  ) : (
                    <Cell
                      value={value}
                      row={row}
                      rowIndex={originalIndex}
                      config={column.cellRenderer}
                      align={column.align}
                    />
                  )}
                </td>
              )
            })}
        </tr>
      )
    })
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* 工具栏 */}
      <TableToolbar
        config={toolbarConfig}
        columns={allColumns}
        visibleColumns={visibleColumns}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleColumn={handleToggleColumn}
        density="default"
        selectedCount={selection.selectedRows.size}
        onClearSelection={handleClearSelection}
      />

      {/* 表格 */}
      <div className="relative flex-1 overflow-auto">
        {loading ? (
          <TableSkeleton rows={skeletonRows} columns={columns.length} />
        ) : paginatedData.data.length === 0 ? (
          <TableEmpty text={emptyText} />
        ) : (
          <table className={cn('w-full border-collapse', bordered && 'border')}>
            {showHeader && renderHeader()}
            <tbody>{renderRows()}</tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      <TablePagination
        config={paginationConfig}
        current={paginationState.page}
        pageSize={paginationState.pageSize}
        total={paginatedData.total}
        totalPages={paginatedData.totalPages}
        onChange={(page) => setPaginationState((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPaginationState({ page: 1, pageSize })}
      />
    </div>
  )
}

// 显示名称
DataTable.displayName = 'DataTable'

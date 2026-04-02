/**
 * DataTable 组件配置类型定义
 * 支持 JSON 配置化的表格字段定义
 */

/** 基础数据类型 */
export type CellValue = string | number | boolean | null | undefined | Date

/** 行数据类型 */
export type RowData = Record<string, CellValue>

/** 单元格对齐方式 */
export type CellAlignment = 'left' | 'center' | 'right' | 'start' | 'end'

/** 列宽类型 */
export type ColumnWidth = string | number | 'auto' | 'min' | 'max' | 'fr'

/** 列排序配置 */
export interface SortConfig {
  /** 是否可排序 */
  enable?: boolean
  /** 默认排序方向 */
  defaultSort?: 'asc' | 'desc'
  /** 多列排序时的优先级 */
  sortIndex?: number
}

/** 排序方向 */
export type SortDirection = 'asc' | 'desc'

/** 列筛选配置 */
export interface FilterConfig {
  /** 是否可筛选 */
  enable?: boolean
  /** 筛选类型 */
  type?: 'text' | 'select' | 'date' | 'number' | 'boolean'
  /** 筛选选项（用于 select 类型） */
  options?: Array<{ label: string; value: string | number }>
  /** 是否支持多选 */
  multiSelect?: boolean
}

/** 列操作按钮配置 */
export interface ActionButton {
  /** 按钮唯一标识 */
  id: string
  /** 按钮文字 */
  label?: string
  /** 图标 */
  icon?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 按钮变体 */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** 点击回调 */
  onClick?: (row: RowData, rowIndex: number) => void
  /** 是否显示 */
  showWhen?: (row: RowData) => boolean
  /** 是否禁用 */
  disabledWhen?: (row: RowData) => boolean
  /** 权限标识 */
  permission?: string
}

/** 操作列配置 */
export interface ActionsConfig {
  /** 列标识 */
  id?: string
  /** 列标题 */
  header?: string
  /** 列宽 */
  width?: ColumnWidth
  /** 对齐方式 */
  align?: CellAlignment
  /** 固定位置 */
  fixed?: 'left' | 'right'
  /** 操作按钮列表 */
  buttons: ActionButton[]
  /** 按钮布局 */
  layout?: 'row' | 'dropdown'
  /** dropdown 触发文字 */
  dropdownTriggerText?: string
}

/** 自定义单元格渲染配置 */
export interface CellRendererConfig {
  /** 渲染类型 */
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'datetime'
    | 'boolean'
    | 'badge'
    | 'tag'
    | 'avatar'
    | 'image'
    | 'progress'
    | 'currency'
    | 'percentage'
    | 'custom'
  /** 自定义渲染函数（type 为 custom 时使用） */
  render?: (value: CellValue, row: RowData, rowIndex: number) => React.ReactNode
  /** 格式化配置 */
  format?: {
    /** 日期格式（用于 date/datetime 类型） */
    dateFormat?: string
    /** 数字格式（用于 number 类型） */
    precision?: number
    /** 货币符号（用于 currency 类型） */
    currency?: string
    /** 货币代码 */
    currencyCode?: string
    /** 显示千分位 */
    thousandSeparator?: boolean
    /** 布尔值显示文本 */
    trueText?: string
    falseText?: string
  }
  /** Badge/Tag 配置 */
  badgeConfig?: {
    /** 映射配置 */
    mapping?: Array<{
      value: string | number | boolean
      label: string
      variant?: 'default' | 'secondary' | 'destructive' | 'outline'
      className?: string
    }>
    /** 默认变体 */
    defaultVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  /** Avatar 配置 */
  avatarConfig?: {
    /** 图片字段名 */
    srcField?: string
    /** 名称字段名 */
    nameField?: string
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
  }
  /** Image 配置 */
  imageConfig?: {
    /** 宽度 */
    width?: number
    /** 高度 */
    height?: number
    /** 是否圆形 */
    rounded?: boolean
    /** 预览 */
    preview?: boolean
  }
  /** Progress 配置 */
  progressConfig?: {
    /** 最大值 */
    max?: number
    /** 显示数值 */
    showValue?: boolean
  }
}

/** 列配置 */
export interface ColumnConfig {
  /** 列唯一标识 */
  id: string
  /** 列标题（表头文字） */
  header: string
  /** 数据字段名（支持嵌套路径，如 'user.name'） */
  accessor: string
  /** 列宽 */
  width?: ColumnWidth
  /** 最小宽度 */
  minWidth?: number | string
  /** 最大宽度 */
  maxWidth?: number | string
  /** 对齐方式 */
  align?: CellAlignment
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可筛选 */
  filterable?: boolean
  /** 筛选类型 */
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean'
  /** 筛选选项 */
  filterOptions?: Array<{ label: string; value: string | number }>
  /** 是否可隐藏 */
  hideable?: boolean
  /** 默认是否隐藏 */
  defaultHidden?: boolean
  /** 固定列 */
  fixed?: 'left' | 'right'
  /** 列顺序 */
  order?: number
  /** 列样式类名 */
  className?: string
  /** 表头样式类名 */
  headerClassName?: string
  /** 单元格渲染配置 */
  cellRenderer?: CellRendererConfig
  /** 自定义渲染函数 */
  render?: (value: CellValue, row: RowData, rowIndex: number) => React.ReactNode
  /** 列分组 */
  group?: string
  /** 工具提示 */
  tooltip?: string
  /** 是否启用列虚拟化 */
  enableVirtualization?: boolean
}

/** 表格配置 */
export interface TableConfig<T extends RowData = RowData> {
  /** 表格标识 */
  id?: string
  /** 列配置列表 */
  columns: ColumnConfig[]
  /** 操作列配置 */
  actions?: ActionsConfig
  /** 是否显示表头 */
  showHeader?: boolean
  /** 表头高度 */
  headerHeight?: number
  /** 行高 */
  rowHeight?: number
  /** 是否显示斑马纹 */
  striped?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示紧凑模式 */
  compact?: boolean
  /** 是否启用虚拟滚动 */
  virtualized?: boolean
  /** 虚拟滚动行数 */
  virtualizedRows?: number
  /** 空数据展示文本 */
  emptyText?: string
  /** 空数据展示组件 */
  emptyComponent?: React.ReactNode
  /** 加载状态 */
  loading?: boolean
  /** 加载骨架行数 */
  skeletonRows?: number
  /** 选中模式 */
  selectable?: 'none' | 'single' | 'multiple'
  /** 默认选中的行索引 */
  defaultSelectedRows?: number[]
  /** 行点击事件 */
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void
  /** 行双击事件 */
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void
  /** 行类名函数 */
  rowClassName?: (row: T, rowIndex: number) => string
  /** 单元格类名函数 */
  cellClassName?: (value: CellValue, row: T, column: ColumnConfig, rowIndex: number) => string
  /** 自定义国际化文本 */
  i18n?: {
    /** 搜索placeholder */
    searchPlaceholder?: string
    /** 暂无数据文本 */
    noData?: string
    /** 加载中文本 */
    loading?: string
    /** 选中行数文本 */
    selectedRows?: string
    /** 清除选择文本 */
    clearSelection?: string
  }
}

/** 分页配置 */
export interface PaginationConfig {
  /** 是否显示分页 */
  show?: boolean
  /** 每页显示条数选项 */
  pageSizeOptions?: number[]
  /** 默认每页条数 */
  defaultPageSize?: number
  /** 是否显示总数 */
  showTotal?: boolean
  /** 总数显示格式 */
  totalFormat?: (total: number, range: [number, number]) => string
  /** 是否显示跳转页 */
  showJumper?: boolean
  /** 跳转页placeholder */
  jumperPlaceholder?: string
  /** 首页文字 */
  prevText?: string
  /** 末页文字 */
  nextText?: string
}

/** 工具栏配置 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 是否显示搜索 */
  search?: {
    show?: boolean
    placeholder?: string
    /** 搜索字段（默认搜索所有可搜索列） */
    fields?: string[]
    /** 搜索延迟（毫秒） */
    debounce?: number
    /** 搜索模式 */
    mode?: 'includes' | 'startsWith' | 'exact'
  }
  /** 是否显示列设置 */
  columnSettings?: {
    show?: boolean
    /** 可配置的列 */
    configurableColumns?: string[]
  }
  /** 是否显示刷新按钮 */
  refresh?: {
    show?: boolean
    /** 刷新回调 */
    onRefresh?: () => void
  }
  /** 是否显示密度切换 */
  density?: {
    show?: boolean
    options?: Array<{ label: string; value: 'compact' | 'default' | 'comfortable' }>
  }
  /** 工具栏右侧插槽 */
  rightSlot?: React.ReactNode
  /** 工具栏左侧插槽 */
  leftSlot?: React.ReactNode
}

/** DataTable 完整配置 */
export interface DataTableConfig<T extends RowData = RowData>
  extends Partial<TableConfig<T>>,
    Partial<{
      pagination: PaginationConfig
      toolbar: ToolbarConfig
    }> {}

/** 行选中状态 */
export interface SelectionState {
  selectedRows: Set<number>
  isAllSelected: boolean
  isIndeterminate: boolean
}

/** 排序状态 */
export interface SortState {
  sortKey: string | null
  sortDirection: 'asc' | 'desc' | null
}

/** 筛选状态 */
export interface FilterState {
  [columnId: string]: CellValue | CellValue[]
}

/** 表格内部状态 */
export interface TableState {
  data: RowData[]
  originalData: RowData[]
  columns: ColumnConfig[]
  visibleColumns: Set<string>
  sortState: SortState
  filterState: FilterState
  searchQuery: string
  pagination: {
    page: number
    pageSize: number
  }
  selection: SelectionState
  loading: boolean
}

/** 使用 DataTable hook 的配置参数 */
export interface UseDataTableOptions<T extends RowData = RowData> {
  /** 原始数据 */
  data: T[]
  /** 表格配置 */
  config: DataTableConfig<T>
  /** 外部控制的排序状态 */
  controlledSortState?: SortState
  /** 外部控制的筛选状态 */
  controlledFilterState?: FilterState
  /** 外部控制的分页状态 */
  controlledPagination?: { page: number; pageSize: number }
  /** 外部控制的搜索 */
  controlledSearch?: string
  /** 排序变更回调 */
  onSortChange?: (state: SortState) => void
  /** 筛选变更回调 */
  onFilterChange?: (state: FilterState) => void
  /** 分页变更回调 */
  onPaginationChange?: (pagination: { page: number; pageSize: number }) => void
  /** 搜索变更回调 */
  onSearchChange?: (query: string) => void
  /** 选中行变更回调 */
  onSelectionChange?: (state: SelectionState) => void
}

/** 使用 DataTable hook 的返回值 */
export interface UseDataTableReturn<T extends RowData = RowData> {
  /** 表格数据 */
  tableData: T[]
  /** 总数据条数 */
  totalRows: number
  /** 当前页数据 */
  currentPageData: T[]
  /** 可见列配置 */
  visibleColumns: ColumnConfig[]
  /** 排序状态 */
  sortState: SortState
  /** 筛选状态 */
  filterState: FilterState
  /** 搜索关键词 */
  searchQuery: string
  /** 分页状态 */
  pagination: { page: number; pageSize: number; total: number }
  /** 选中状态 */
  selection: SelectionState
  /** 是否加载中 */
  loading: boolean
  /** 是否有数据 */
  isEmpty: boolean
  /** 是否有筛选条件 */
  hasFilters: boolean
  /** 操作方法 */
  actions: {
    /** 排序 */
    sort: (columnId: string, direction?: 'asc' | 'desc') => void
    /** 筛选 */
    filter: (columnId: string, value: CellValue | CellValue[]) => void
    /** 清除筛选 */
    clearFilters: () => void
    /** 搜索 */
    search: (query: string) => void
    /** 设置页码 */
    setPage: (page: number) => void
    /** 设置每页条数 */
    setPageSize: (size: number) => void
    /** 切换列显示 */
    toggleColumn: (columnId: string) => void
    /** 重置所有状态 */
    reset: () => void
    /** 全选 */
    selectAll: () => void
    /** 取消全选 */
    deselectAll: () => void
    /** 切换行选中 */
    toggleRow: (rowIndex: number) => void
    /** 选中指定行 */
    selectRow: (rowIndex: number) => void
    /** 取消选中指定行 */
    deselectRow: (rowIndex: number) => void
  }
}

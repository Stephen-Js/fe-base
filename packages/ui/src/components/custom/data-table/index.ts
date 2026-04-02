/**
 * DataTable - 通用表格组件
 *
 * 基于 TanStack Table 理念封装的 React 表格组件
 * 支持 JSON 配置化表格字段定义
 *
 * @example
 * ```tsx
 * import { DataTable } from '@repo/ui/custom/data-table'
 *
 * const columns = [
 *   { id: 'name', header: '姓名', accessor: 'name' },
 *   { id: 'age', header: '年龄', accessor: 'age', sortable: true },
 *   { id: 'status', header: '状态', accessor: 'status', cellRenderer: { type: 'badge' } },
 * ]
 *
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   pagination={{ show: true, defaultPageSize: 20 }}
 *   toolbar={{ search: { show: true } }}
 * />
 * ```
 */

// 子组件导出
export {
  ActionButton as DataTableActionButton,
  Cell,
  useCellRenderer,
} from './cell-renderer'
export type { DataTableProps } from './data-table'
// 组件导出
export { DataTable } from './data-table'
export {
  ColumnSettings,
  DensitySwitch,
  Pagination,
  RefreshButton,
  SearchInput,
  TableEmpty,
  TablePagination,
  TableSkeleton,
  TableToolbar,
} from './toolbar'
// 类型导出
export type {
  ActionButton,
  ActionsConfig,
  CellAlignment,
  CellRendererConfig,
  // 基础类型
  CellValue,
  // 表格配置
  ColumnConfig,
  ColumnWidth,
  DataTableConfig,
  FilterConfig,
  FilterState,
  PaginationConfig,
  RowData,
  // 状态类型
  SelectionState,
  // 列配置
  SortConfig,
  SortDirection,
  SortState,
  TableConfig,
  TableState,
  ToolbarConfig,
  // Hook 类型
  UseDataTableOptions,
  UseDataTableReturn,
} from './types'
// 工具函数导出
export {
  cn,
  deepMerge,
  filterData,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  generateId,
  getNestedValue,
  isEmpty,
  paginateData,
  searchData,
  setNestedValue,
  sortData,
  transformCase,
  truncateText,
} from './utils'

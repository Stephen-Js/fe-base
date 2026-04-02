/**
 * DataTable 工具函数
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { CellValue, ColumnConfig, RowData, SortDirection } from './types'

/** 合并 className */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取嵌套对象属性值
 * 支持 'user.name' 或 'user[0].name' 格式
 */
export function getNestedValue<T = CellValue>(
  obj: RowData,
  path: string,
  defaultValue: T | null = null
): T | null {
  if (!path || !obj) return defaultValue

  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key]
    } else {
      return defaultValue
    }
  }

  return (current === undefined ? defaultValue : current) as T | null
}

/**
 * 设置嵌套对象属性值
 */
export function setNestedValue(obj: RowData, path: string, value: CellValue): RowData {
  if (!path) return obj

  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const result = { ...obj }
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current[key] = { ...(current[key] as Record<string, unknown>) }
    current = current[key] as Record<string, unknown>
  }

  const lastKey = keys[keys.length - 1] as string
  current[lastKey] = value
  return result
}

/** 格式化日期 */
export function formatDate(value: CellValue, format: string = 'YYYY-MM-DD'): string {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(value as string | number)

  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/** 格式化数字 */
export function formatNumber(
  value: CellValue,
  options: {
    precision?: number
    thousandSeparator?: boolean
    currency?: string
    currencyCode?: string
  } = {}
): string {
  if (value === null || value === undefined || value === '') return '-'

  const num = typeof value === 'number' ? value : parseFloat(value as string)

  if (isNaN(num)) return '-'

  const { precision = 2, thousandSeparator = true, currency } = options

  let result: string

  if (thousandSeparator) {
    result = num.toLocaleString('zh-CN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })
  } else {
    result = num.toFixed(precision)
  }

  if (currency) {
    return `${currency}${result}`
  }

  return result
}

/** 格式化百分比 */
export function formatPercentage(
  value: CellValue,
  precision: number = 2,
  showSign: boolean = false
): string {
  if (value === null || value === undefined || value === '') return '-'

  const num = typeof value === 'number' ? value : parseFloat(value as string)

  if (isNaN(num)) return '-'

  const sign = showSign && num > 0 ? '+' : ''
  return `${sign}${(num * 100).toFixed(precision)}%`
}

/** 格式化货币 */
export function formatCurrency(
  value: CellValue,
  currency: string = 'CNY',
  locale: string = 'zh-CN'
): string {
  if (value === null || value === undefined || value === '') return '-'

  const num = typeof value === 'number' ? value : parseFloat(value as string)

  if (isNaN(num)) return '-'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(num)
  } catch {
    return '-'
  }
}

/** 截断文本 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + suffix
}

/** 大小写转换 */
export function transformCase(
  value: CellValue,
  caseType: 'upper' | 'lower' | 'capitalize' | 'title'
): string {
  if (!value) return '-'
  const str = String(value)

  switch (caseType) {
    case 'upper':
      return str.toUpperCase()
    case 'lower':
      return str.toLowerCase()
    case 'capitalize':
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    case 'title':
      return str.replace(/\b\w/g, (c) => c.toUpperCase())
    default:
      return str
  }
}

/** 通用排序函数 */
export function sortData<T extends RowData>(
  data: T[],
  column: ColumnConfig,
  direction: SortDirection
): T[] {
  if (!direction) return data

  return [...data].sort((a, b) => {
    const valueA = getNestedValue(a, column.accessor)
    const valueB = getNestedValue(b, column.accessor)

    // 处理空值
    if (valueA === null || valueA === undefined) {
      return direction === 'asc' ? 1 : -1
    }
    if (valueB === null || valueB === undefined) {
      return direction === 'asc' ? -1 : 1
    }

    // 数字比较
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA
    }

    // 日期比较
    if (valueA instanceof Date && valueB instanceof Date) {
      const timeA = valueA.getTime()
      const timeB = valueB.getTime()
      return direction === 'asc' ? timeA - timeB : timeB - timeA
    }

    // 字符串比较
    const strA = String(valueA)
    const strB = String(valueB)

    if (direction === 'asc') {
      return strA.localeCompare(strB, 'zh-CN', { sensitivity: 'base' })
    }
    return strB.localeCompare(strA, 'zh-CN', { sensitivity: 'base' })
  })
}

/** 通用筛选函数 */
export function filterData<T extends RowData>(
  data: T[],
  filters: Record<string, CellValue | CellValue[]>,
  columns: ColumnConfig[]
): T[] {
  if (!Object.keys(filters).length) return data

  return data.filter((row) => {
    return Object.entries(filters).every(([columnId, filterValue]) => {
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        return true
      }

      const column = columns.find((col) => col.id === columnId)
      if (!column) return true

      const cellValue = getNestedValue(row, column.accessor)

      if (Array.isArray(filterValue)) {
        if (!filterValue.length) return true
        return filterValue.some((v) => String(v) === String(cellValue))
      }

      // 布尔值处理
      if (typeof cellValue === 'boolean') {
        return String(cellValue) === String(filterValue)
      }

      // 数字处理
      if (typeof cellValue === 'number' && typeof filterValue === 'number') {
        return cellValue === filterValue
      }

      // 字符串包含匹配
      return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())
    })
  })
}

/** 搜索函数 */
export function searchData<T extends RowData>(
  data: T[],
  query: string,
  columns: ColumnConfig[],
  searchFields?: string[]
): T[] {
  if (!query || !query.trim()) return data

  const searchTerm = query.toLowerCase().trim()

  // 确定要搜索的列
  const fieldsToSearch = searchFields?.length
    ? columns.filter((col) => searchFields.includes(col.id) && col.filterable !== false)
    : columns.filter((col) => col.filterable !== false && col.accessor !== 'actions')

  return data.filter((row) => {
    return fieldsToSearch.some((column) => {
      const value = getNestedValue(row, column.accessor)
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  })
}

/** 生成分页数据 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
} {
  const total = data.length
  const totalPages = Math.ceil(total / pageSize) || 1
  const validPage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)

  return {
    data: data.slice(startIndex, endIndex),
    total,
    page: validPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
  }
}

/** 生成唯一 ID */
export function generateId(prefix: string = 'table'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/** 判断值是否为空 */
export function isEmpty(value: CellValue): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/** 深度合并对象 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as T[Extract<
        keyof T,
        string
      >]
    } else {
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

/** 从列配置中提取访问器映射 */
export function getColumnAccessorMap(columns: ColumnConfig[]): Map<string, ColumnConfig> {
  const map = new Map<string, ColumnConfig>()

  for (const column of columns) {
    map.set(column.id, column)
    map.set(column.accessor, column)
  }

  return map
}

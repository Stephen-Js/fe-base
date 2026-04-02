/**
 * 单元格渲染组件
 * 支持多种内置渲染类型和自定义渲染
 */

'use client'

import { cn } from '@repo/utils'
import { CheckCircle, XCircle } from 'lucide-react'
import * as React from 'react'

import { buttonVariants } from '../../shadcn/button'
import type { CellRendererConfig, CellValue, RowData } from './types'
import { formatCurrency, formatDate, formatNumber, formatPercentage, getNestedValue } from './utils'

// Badge 组件
const Badge: React.FC<{
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background text-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Tag 组件
const Tag: React.FC<{
  children: React.ReactNode
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  className?: string
}> = ({ children, color = 'default', className }) => {
  const colors = {
    default: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}

// Avatar 组件
const Avatar: React.FC<{
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ src, name, size = 'md', className }) => {
  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="h-full w-full object-cover" />
      ) : name ? (
        <span className="font-medium text-muted-foreground">{getInitials(name)}</span>
      ) : (
        <span className="font-medium text-muted-foreground">?</span>
      )}
    </div>
  )
}

// Image 组件
const ImageCell: React.FC<{
  src: string
  alt?: string
  width?: number
  height?: number
  rounded?: boolean
  preview?: boolean
  className?: string
}> = ({ src, alt = '', width = 40, height = 40, rounded = false, preview = true, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <div
        className={cn('overflow-hidden', rounded ? 'rounded-full' : 'rounded', className)}
        style={{ width, height }}
      >
        <button
          type="button"
          className="flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-transparent p-0 transition-transform hover:scale-110"
          onClick={() => preview && setIsOpen(true)}
          aria-label="点击查看大图"
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        </button>
      </div>
      {isOpen && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </>
  )
}

// Progress Bar 组件
const ProgressBar: React.FC<{
  value: number
  max?: number
  showValue?: boolean
  className?: string
}> = ({ value, max = 100, showValue = true, className }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="min-w-12 text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
      )}
    </div>
  )
}

// Boolean 图标组件
const BooleanIcon: React.FC<{
  value: boolean
  trueText?: string
  falseText?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ value, trueText, falseText, showIcon = true, size = 'md', className }) => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const text = value ? trueText || '是' : falseText || '否'

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {showIcon &&
        (value ? (
          <CheckCircle className={cn(sizes[size], 'text-green-500')} />
        ) : (
          <XCircle className={cn(sizes[size], 'text-red-500')} />
        ))}
      <span>{text}</span>
    </span>
  )
}

// 操作按钮组件 - 使用 shadcn/ui Button
export const ActionButton: React.FC<{
  label?: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick?: () => void
  disabled?: boolean
  className?: string
}> = ({ label, icon, variant = 'ghost', size = 'sm', onClick, disabled, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size: label ? size : 'icon' }), className)}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  )
}

/**
 * 获取单元格对齐样式
 */
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

/**
 * 渲染文本单元格
 */
function renderTextCell(
  value: CellValue,
  _row: RowData,
  _rowIndex: number,
  config?: CellRendererConfig
) {
  const text = value === null || value === undefined ? '-' : String(value)

  if (config?.format?.precision !== undefined) {
    const num = typeof value === 'number' ? value : parseFloat(text)
    if (!Number.isNaN(num)) {
      return formatNumber(num, { precision: config.format.precision })
    }
  }

  if (config?.format?.thousandSeparator !== undefined) {
    const num = typeof value === 'number' ? value : parseFloat(text)
    if (!Number.isNaN(num)) {
      return formatNumber(num, { thousandSeparator: config.format.thousandSeparator })
    }
  }

  return text
}

/**
 * 渲染数字单元格
 */
function renderNumberCell(value: CellValue, config?: CellRendererConfig) {
  if (value === null || value === undefined) return '-'

  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(num)) return '-'

  const { precision = 2, thousandSeparator = true } = config?.format || {}

  return formatNumber(num, { precision, thousandSeparator })
}

/**
 * 渲染日期单元格
 */
function renderDateCell(value: CellValue, config?: CellRendererConfig) {
  const dateFormat = config?.format?.dateFormat || 'YYYY-MM-DD'
  return formatDate(value, dateFormat)
}

/**
 * 渲染日期时间单元格
 */
function renderDateTimeCell(value: CellValue, config?: CellRendererConfig) {
  const dateFormat = config?.format?.dateFormat || 'YYYY-MM-DD HH:mm:ss'
  return formatDate(value, dateFormat)
}

/**
 * 渲染布尔值单元格
 */
function renderBooleanCell(value: CellValue, config?: CellRendererConfig) {
  const boolValue = Boolean(value)

  if (config?.format?.trueText || config?.format?.falseText) {
    return (
      <BooleanIcon
        value={boolValue}
        trueText={config.format.trueText}
        falseText={config.format.falseText}
      />
    )
  }

  return <BooleanIcon value={boolValue} />
}

/**
 * 渲染徽章单元格
 */
function renderBadgeCell(value: CellValue, config?: CellRendererConfig) {
  const strValue = String(value ?? '')
  const mapping = config?.badgeConfig?.mapping

  if (mapping) {
    const matched = mapping.find((m) => String(m.value) === strValue)
    if (matched) {
      return <Badge variant={matched.variant || 'default'}>{matched.label}</Badge>
    }
  }

  return <Badge variant={config?.badgeConfig?.defaultVariant || 'secondary'}>{strValue}</Badge>
}

/**
 * 渲染标签单元格
 */
function renderTagCell(value: CellValue, _config?: CellRendererConfig) {
  const strValue = String(value ?? '')

  const colorMap: Record<string, 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'> = {
    default: 'default',
    primary: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'purple',
  }

  return <Tag color={colorMap[strValue.toLowerCase()] || 'default'}>{strValue}</Tag>
}

/**
 * 渲染头像单元格
 */
function renderAvatarCell(value: CellValue, row: RowData, config?: CellRendererConfig) {
  const avatarConfig = config?.avatarConfig || {}
  const src = avatarConfig.srcField
    ? (getNestedValue(row, avatarConfig.srcField) as string)
    : undefined
  const name = avatarConfig.nameField
    ? (getNestedValue(row, avatarConfig.nameField) as string)
    : String(value ?? '')

  return <Avatar src={src} name={name || String(value ?? '')} size={avatarConfig.size || 'md'} />
}

/**
 * 渲染图片单元格
 */
function renderImageCell(value: CellValue, config?: CellRendererConfig) {
  if (!value) return '-'

  const imageConfig = config?.imageConfig || {}

  return (
    <ImageCell
      src={String(value)}
      alt=""
      width={imageConfig.width}
      height={imageConfig.height}
      rounded={imageConfig.rounded}
      preview={imageConfig.preview !== false}
    />
  )
}

/**
 * 渲染进度条单元格
 */
function renderProgressCell(value: CellValue, config?: CellRendererConfig) {
  if (value === null || value === undefined) return '-'

  const num = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(num)) return '-'

  const max = config?.progressConfig?.max || 100
  const showValue = config?.progressConfig?.showValue !== false

  return <ProgressBar value={num} max={max} showValue={showValue} />
}

/**
 * 渲染货币单元格
 */
function renderCurrencyCell(value: CellValue, config?: CellRendererConfig) {
  const currency = config?.format?.currency || '¥'
  return formatCurrency(value, currency)
}

/**
 * 渲染百分比单元格
 */
function renderPercentageCell(value: CellValue, config?: CellRendererConfig) {
  const precision = config?.format?.precision ?? 2
  return formatPercentage(value, precision)
}

/**
 * 通用单元格渲染组件
 */
export const Cell: React.FC<{
  value: CellValue
  row: RowData
  rowIndex: number
  config?: CellRendererConfig
  align?: 'left' | 'center' | 'right' | 'start' | 'end'
  className?: string
}> = ({ value, row, rowIndex, config, align, className }) => {
  const cellConfig = config

  const renderContent = () => {
    // 优先使用自定义渲染函数
    if (cellConfig?.render) {
      return cellConfig.render(value, row, rowIndex)
    }

    // 根据类型渲染
    switch (cellConfig?.type) {
      case 'number':
        return renderNumberCell(value, cellConfig)
      case 'date':
        return renderDateCell(value, cellConfig)
      case 'datetime':
        return renderDateTimeCell(value, cellConfig)
      case 'boolean':
        return renderBooleanCell(value, cellConfig)
      case 'badge':
        return renderBadgeCell(value, cellConfig)
      case 'tag':
        return renderTagCell(value, cellConfig)
      case 'avatar':
        return renderAvatarCell(value, row, cellConfig)
      case 'image':
        return renderImageCell(value, cellConfig)
      case 'progress':
        return renderProgressCell(value, cellConfig)
      case 'currency':
        return renderCurrencyCell(value, cellConfig)
      case 'percentage':
        return renderPercentageCell(value, cellConfig)
      case 'custom':
        return value !== null && value !== undefined ? String(value) : '-'
      case 'text':
      default:
        return renderTextCell(value, row, rowIndex, cellConfig)
    }
  }

  return (
    <div className={cn('flex items-center', getAlignmentClass(align), className)}>
      {renderContent()}
    </div>
  )
}

/**
 * 单元格渲染 Hook
 */
export function useCellRenderer<T extends RowData = RowData>() {
  const render = React.useCallback(
    (value: CellValue, row: T, rowIndex: number, config?: CellRendererConfig) => {
      return <Cell value={value} row={row} rowIndex={rowIndex} config={config} />
    },
    []
  )

  return { render }
}

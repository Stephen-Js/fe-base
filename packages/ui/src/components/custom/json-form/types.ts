/**
 * JsonForm 组件类型定义
 * 支持 JSON 配置化的表单字段定义
 */

import type { UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

/** 字段类型 */
export type FieldType =
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'upload'

/** 网格配置 */
export interface GridConfig {
  /** 占用列数 (1-12) */
  span?: number
  /** 偏移列数 */
  offset?: number
}

/** 选项配置 */
export interface SelectOption {
  /** 显示文本 */
  label: string
  /** 选项值 */
  value: string | number
  /** 是否禁用 */
  disabled?: boolean
}

/** 字段配置 */
export interface FieldConfig {
  /** 字段名 */
  name: string
  /** 字段类型 */
  type: FieldType
  /** 标签 */
  label?: string
  /** 占位符 */
  placeholder?: string
  /** 描述文字 */
  description?: string
  /** 是否必填 */
  required?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 网格布局 */
  grid?: GridConfig
  /** 默认值 */
  defaultValue?: unknown
  /** 选项（select/radio/checkbox 使用） */
  options?: SelectOption[]
  /** Zod 验证规则 */
  validation?: z.ZodType
  /** 传递给基础组件的额外属性 */
  props?: Record<string, unknown>
  /** 自定义类名 */
  className?: string
}

/** 按钮变体类型 */
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

/** API 提交配置 */
export interface ApiConfig {
  /** 请求 URL */
  url: string
  /** 请求方法 */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** 请求头 */
  headers?: Record<string, string>
  /** 数据转换函数 */
  transformData?: (data: Record<string, unknown>) => unknown
}

/** 提交配置 */
export interface SubmitConfig {
  /** 按钮文字 */
  text?: string
  /** 加载中文字 */
  loadingText?: string
  /** 按钮样式 */
  variant?: ButtonVariant
  /** API 配置 */
  api?: ApiConfig
}

/** 表单配置 */
export interface JsonFormConfig {
  /** 字段列表 */
  fields: FieldConfig[]
  /** 提交配置，false 表示不显示提交按钮 */
  submit?: SubmitConfig | false
  /** 标签布局 */
  layout?: 'horizontal' | 'vertical'
  /** 网格列数，默认 12 */
  columns?: number
}

/** 表单数据类型 */
export type FormData = Record<string, unknown>

/** JsonForm 组件 Props */
export interface JsonFormProps {
  /** 表单配置 */
  config: JsonFormConfig
  /** 自定义提交回调 */
  onSubmit?: (data: FormData) => void | Promise<void>
  /** 值变化回调 */
  onValuesChange?: (values: FormData) => void
  /** 表单实例引用，用于外部获取表单状态 */
  formRef?: React.MutableRefObject<UseFormReturn<FormData> | null>
  /** 默认值 */
  defaultValues?: FormData
  /** 自定义类名 */
  className?: string
}

/** 字段渲染器 Props */
export interface FieldRendererProps {
  /** 字段配置 */
  field: FieldConfig
  /** 表单控制实例 */
  control: UseFormReturn<FormData>['control']
}

/**
 * JsonForm 工具函数
 */

import type { CSSProperties } from 'react'
import { z } from 'zod'
import type { ApiConfig, FieldConfig, FormData, JsonFormConfig } from './types'

/**
 * 从字段配置构建 Zod Schema
 */
export function buildSchema(fields: FieldConfig[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    if (field.validation) {
      shape[field.name] = field.validation
    } else {
      // 默认 Schema
      shape[field.name] = z.any().optional()
    }
  }

  return z.object(shape)
}

/**
 * 从字段配置获取默认值
 */
export function getDefaultValues(fields: FieldConfig[]): FormData {
  const defaults: FormData = {}

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue
    }
  }

  return defaults
}

/**
 * 计算字段网格样式
 * 返回 CSS 样式对象而非 Tailwind 类名，避免动态类名无法被 Tailwind 识别的问题
 */
export function getGridStyle(grid?: FieldConfig['grid'], columns = 12): CSSProperties {
  if (!grid) {
    return { gridColumn: '1 / -1' }
  }

  const span = grid.span ?? columns
  const offset = grid.offset ?? 0

  const style: CSSProperties = {
    gridColumn: `span ${span} / span ${span}`,
  }

  if (offset > 0) {
    style.gridColumnStart = offset + 1
  }

  return style
}

/**
 * 合并表单配置
 */
export function mergeConfig(
  config: JsonFormConfig,
  defaultConfig: Partial<JsonFormConfig>
): JsonFormConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}

/**
 * 判断字段是否为多选类型
 */
export function isMultiSelectField(field: FieldConfig): boolean {
  return field.type === 'multi-select' || field.type === 'checkbox'
}

/**
 * 判断字段是否为选择类型
 */
export function isSelectField(field: FieldConfig): boolean {
  return field.type === 'select' || field.type === 'multi-select' || field.type === 'radio'
}

/**
 * 格式化 API 请求数据
 */
export async function submitToApi(api: ApiConfig, data: FormData): Promise<Response> {
  const { url, method, headers, transformData } = api

  const body = transformData ? transformData(data) : data

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  })

  return response
}

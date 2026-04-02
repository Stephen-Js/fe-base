/**
 * JsonForm - JSON 驱动的动态表单组件
 *
 * 通过 JSON 配置渲染表单字段，支持：
 * - 多种字段类型：文本、密码、邮箱、数字、文本域、下拉选择、单选、多选、开关、日期、上传
 * - 网格布局
 * - Zod 验证
 * - 外部状态消费
 * - API 提交
 *
 * @example
 * ```tsx
 * import { JsonForm } from '@repo/ui/custom/json-form'
 * import { z } from 'zod'
 *
 * const formConfig = {
 *   fields: [
 *     { name: 'username', type: 'text', label: '用户名', grid: { span: 6 } },
 *     { name: 'email', type: 'email', label: '邮箱', grid: { span: 6 } },
 *   ],
 *   submit: { text: '提交', api: { url: '/api/users', method: 'POST' } },
 * }
 *
 * <JsonForm config={formConfig} />
 * ```
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/shadcn/button'
import { Form } from '@repo/ui/shadcn/form'
import { cn } from '@repo/utils'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CheckboxField,
  DateField,
  RadioField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
  UploadField,
} from './fields'
import type { FormData, JsonFormConfig, JsonFormProps } from './types'
import { buildSchema, getDefaultValues, getGridStyle, submitToApi } from './utils'

/** 默认配置 */
const DEFAULT_CONFIG: Partial<JsonFormConfig> = {
  layout: 'vertical',
  columns: 12,
}

/**
 * 根据字段类型获取对应的渲染组件
 */
function getFieldRenderer(type: JsonFormConfig['fields'][0]['type']) {
  switch (type) {
    case 'text':
    case 'password':
    case 'email':
    case 'number':
      return TextField
    case 'textarea':
      return TextareaField
    case 'select':
    case 'multi-select':
      return SelectField
    case 'checkbox':
      return CheckboxField
    case 'radio':
      return RadioField
    case 'switch':
      return SwitchField
    case 'date':
    case 'datetime':
      return DateField
    case 'upload':
      return UploadField
    default:
      return TextField
  }
}

/**
 * JsonForm 主组件
 */
export function JsonForm({
  config: userConfig,
  onSubmit,
  onValuesChange,
  formRef,
  defaultValues: externalDefaultValues,
  className,
}: JsonFormProps) {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 构建 Zod Schema
  const schema = buildSchema(config.fields)

  // 获取默认值
  const defaultValues = {
    ...getDefaultValues(config.fields),
    ...externalDefaultValues,
  }

  // 初始化表单
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  // 暴露表单实例给外部
  useEffect(() => {
    if (formRef) {
      formRef.current = form
    }
  }, [form, formRef])

  // 监听值变化
  useEffect(() => {
    if (onValuesChange) {
      const subscription = form.watch((value) => {
        onValuesChange(value as FormData)
      })
      return () => subscription.unsubscribe()
    }
  }, [form, onValuesChange])

  // 处理提交
  const handleSubmit = async (data: FormData) => {
    // 如果有自定义提交回调，优先执行
    if (onSubmit) {
      await onSubmit(data)
      return
    }

    // 如果配置了 API 提交
    if (config.submit && typeof config.submit !== 'boolean' && config.submit.api) {
      setIsSubmitting(true)
      try {
        const response = await submitToApi(config.submit.api, data)
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }
        console.log('提交成功')
      } catch (error) {
        console.error('提交失败:', error)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        {/* 字段网格 */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}
        >
          {config.fields.map((field) => {
            const FieldRenderer = getFieldRenderer(field.type)
            const gridStyle = getGridStyle(field.grid, config.columns)

            return (
              <div key={field.name} className={gridStyle}>
                <FieldRenderer field={field} control={form.control} />
              </div>
            )
          })}
        </div>

        {/* 提交按钮 */}
        {config.submit !== false && (
          <div className="flex justify-end">
            <Button
              type="submit"
              variant={config.submit?.variant || 'default'}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? config.submit?.loadingText || '提交中...'
                : config.submit?.text || '提交'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

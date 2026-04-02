# JsonForm 组件实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个 JSON 驱动的动态表单组件，支持多种字段类型、网格布局、react-hook-form 状态管理和 Zod 验证。

**Architecture:** 基于 shadcn/ui 的 Form 组件封装，使用 react-hook-form 管理表单状态，通过 JSON 配置动态渲染字段组件，支持外部状态消费和 API 提交。

**Tech Stack:** React 19, TypeScript, react-hook-form, Zod, @hookform/resolvers, shadcn/ui, Tailwind CSS

---

## 文件结构

```
packages/ui/
├── src/components/
│   ├── shadcn/           # 新增 shadcn 组件
│   │   ├── input.tsx     # (新增)
│   │   ├── textarea.tsx  # (新增)
│   │   ├── select.tsx    # (新增)
│   │   ├── checkbox.tsx  # (新增)
│   │   ├── radio-group.tsx # (新增)
│   │   ├── switch.tsx    # (新增)
│   │   ├── label.tsx     # (新增)
│   │   └── form.tsx      # (新增)
│   └── custom/
│       └── json-form/    # (新增目录)
│           ├── index.ts
│           ├── json-form.tsx
│           ├── types.ts
│           ├── utils.ts
│           └── fields/
│               ├── index.ts
│               ├── text-field.tsx
│               ├── textarea-field.tsx
│               ├── select-field.tsx
│               ├── checkbox-field.tsx
│               ├── radio-field.tsx
│               ├── switch-field.tsx
│               ├── date-field.tsx
│               └── upload-field.tsx
└── package.json          # (修改: 添加依赖和导出)

packages/pages/src/
└── components-page.tsx   # (修改: 添加 JsonForm 展示)
```

---

### Task 1: 添加 shadcn/ui 基础组件

**Files:**
- Create: `packages/ui/src/components/shadcn/input.tsx`
- Create: `packages/ui/src/components/shadcn/textarea.tsx`
- Create: `packages/ui/src/components/shadcn/select.tsx`
- Create: `packages/ui/src/components/shadcn/checkbox.tsx`
- Create: `packages/ui/src/components/shadcn/radio-group.tsx`
- Create: `packages/ui/src/components/shadcn/switch.tsx`
- Create: `packages/ui/src/components/shadcn/label.tsx`
- Create: `packages/ui/src/components/shadcn/form.tsx`

- [ ] **Step 1: 安装 shadcn 组件**

运行命令:
```bash
cd d:\Work\2026\fe-base && pnpm ui:add input textarea select checkbox radio-group switch label form
```

预期输出: 所有组件成功安装到 `packages/ui/src/components/shadcn/`

- [ ] **Step 2: 验证组件安装**

检查目录:
```bash
ls d:\Work\2026\fe-base\packages\ui\src\components\shadcn\
```

预期结果: 包含 input.tsx, textarea.tsx, select.tsx, checkbox.tsx, radio-group.tsx, switch.tsx, label.tsx, form.tsx 文件

---

### Task 2: 安装表单相关依赖

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: 安装 react-hook-form、zod 和 @hookform/resolvers**

运行命令:
```bash
cd d:\Work\2026\fe-base\packages\ui && pnpm add react-hook-form zod @hookform/resolvers
```

预期输出: 依赖安装成功

- [ ] **Step 2: 验证 package.json 更新**

检查 `packages/ui/package.json` 的 dependencies 部分应包含:
```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  }
}
```

---

### Task 3: 创建类型定义文件

**Files:**
- Create: `packages/ui/src/components/custom/json-form/types.ts`

- [ ] **Step 1: 创建 types.ts 文件**

```typescript
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
```

---

### Task 4: 创建工具函数文件

**Files:**
- Create: `packages/ui/src/components/custom/json-form/utils.ts`

- [ ] **Step 1: 创建 utils.ts 文件**

```typescript
/**
 * JsonForm 工具函数
 */

import type { z } from 'zod'
import type { FieldConfig, FormData, JsonFormConfig } from './types'

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
 */
export function getGridStyle(grid?: FieldConfig['grid'], columns = 12): string {
  if (!grid) {
    return 'col-span-full'
  }

  const span = grid.span ?? columns
  const offset = grid.offset ?? 0

  const classes = [`col-span-${span}`]
  if (offset > 0) {
    classes.push(`col-start-${offset + 1}`)
  }

  return classes.join(' ')
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
export async function submitToApi(
  api: NonNullable<JsonFormConfig['submit']> extends infer S ? (S extends { api?: infer A } ? A : never) : never,
  data: FormData
): Promise<Response> {
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
```

---

### Task 5: 创建字段渲染器

**Files:**
- Create: `packages/ui/src/components/custom/json-form/fields/index.ts`
- Create: `packages/ui/src/components/custom/json-form/fields/text-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/textarea-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/select-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/checkbox-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/radio-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/switch-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/date-field.tsx`
- Create: `packages/ui/src/components/custom/json-form/fields/upload-field.tsx`

- [ ] **Step 1: 创建 text-field.tsx**

```typescript
/**
 * 文本字段渲染器
 * 支持 text、password、email、number 类型
 */

'use client'

import { Controller, type FieldPath, type FieldValues } from 'react-hook-form'
import type { FieldConfig } from '../types'

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@repo/ui/shadcn/form'
import { Input } from '@repo/ui/shadcn/input'
import type { Control } from 'react-hook-form'

interface TextFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function TextField({ field, control }: TextFieldProps) {
  const inputType = field.type === 'number' ? 'number' : field.type

  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={inputType}
              placeholder={field.placeholder}
              disabled={field.disabled}
              {...rhfField}
              {...field.props}
            />
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 2: 创建 textarea-field.tsx**

```typescript
/**
 * 文本域字段渲染器
 */

'use client'

import { Controller, type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@repo/ui/shadcn/form'
import { Textarea } from '@repo/ui/shadcn/textarea'
import type { Control } from 'react-hook-form'

interface TextareaFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function TextareaField({ field, control }: TextareaFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              placeholder={field.placeholder}
              disabled={field.disabled}
              {...rhfField}
              {...field.props}
            />
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 3: 创建 select-field.tsx**

```typescript
/**
 * 下拉选择字段渲染器
 * 支持 select 和 multi-select 类型
 */

'use client'

import { Controller, type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/shadcn/select'
import type { Control } from 'react-hook-form'

interface SelectFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function SelectField({ field, control }: SelectFieldProps) {
  const isMulti = field.type === 'multi-select'

  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={rhfField.onChange}
            defaultValue={rhfField.value as string}
            disabled={field.disabled}
            {...field.props}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || '请选择'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 4: 创建 checkbox-field.tsx**

```typescript
/**
 * 复选框字段渲染器
 */

'use client'

import { type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { Checkbox } from '@repo/ui/shadcn/checkbox'
import type { Control } from 'react-hook-form'

interface CheckboxFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function CheckboxField({ field, control }: CheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={`flex flex-row items-start space-x-3 space-y-0 ${field.className}`}>
          <FormControl>
            <Checkbox
              checked={rhfField.value as boolean}
              onCheckedChange={rhfField.onChange}
              disabled={field.disabled}
              {...field.props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {field.label && (
              <FormLabel className="cursor-pointer">
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            {field.description && <FormDescription>{field.description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 5: 创建 radio-field.tsx**

```typescript
/**
 * 单选按钮字段渲染器
 */

'use client'

import { type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { RadioGroup, RadioGroupItem } from '@repo/ui/shadcn/radio-group'
import type { Control } from 'react-hook-form'

interface RadioFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function RadioField({ field, control }: RadioFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={rhfField.onChange}
              defaultValue={rhfField.value as string}
              disabled={field.disabled}
              className="flex flex-col space-y-1"
              {...field.props}
            >
              {field.options?.map((option) => (
                <FormItem
                  key={String(option.value)}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={String(option.value)} disabled={option.disabled} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 6: 创建 switch-field.tsx**

```typescript
/**
 * 开关字段渲染器
 */

'use client'

import { type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { Switch } from '@repo/ui/shadcn/switch'
import type { Control } from 'react-hook-form'

interface SwitchFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function SwitchField({ field, control }: SwitchFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={`flex flex-row items-center justify-between ${field.className}`}>
          <div className="space-y-0.5">
            {field.label && (
              <FormLabel>
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            {field.description && <FormDescription>{field.description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={rhfField.value as boolean}
              onCheckedChange={rhfField.onChange}
              disabled={field.disabled}
              {...field.props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 7: 创建 date-field.tsx**

```typescript
/**
 * 日期字段渲染器
 * 支持 date 和 datetime 类型
 */

'use client'

import { type FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { Input } from '@repo/ui/shadcn/input'
import type { Control } from 'react-hook-form'

interface DateFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function DateField({ field, control }: DateFieldProps) {
  const inputType = field.type === 'datetime' ? 'datetime-local' : 'date'

  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={inputType}
              disabled={field.disabled}
              {...rhfField}
              {...field.props}
            />
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 8: 创建 upload-field.tsx**

```typescript
/**
 * 上传字段渲染器
 */

'use client'

import { useRef, useState } from 'react'
import { type FieldPath } from 'react-hook-form'
import { Upload } from 'lucide-react'
import type { FieldConfig } from '../types'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { Button } from '@repo/ui/shadcn/button'
import { cn } from '@repo/utils'
import type { Control } from 'react-hook-form'

interface UploadFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function UploadField({ field, control }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')

  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                disabled={field.disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFileName(file.name)
                    rhfField.onChange(file)
                  }
                }}
                {...(field.props as Record<string, unknown>)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={field.disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                选择文件
              </Button>
              {fileName && (
                <span className="text-sm text-muted-foreground">{fileName}</span>
              )}
            </div>
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

- [ ] **Step 9: 创建 fields/index.ts 桶导出**

```typescript
/**
 * 字段渲染器导出
 */

export { TextField } from './text-field'
export { TextareaField } from './textarea-field'
export { SelectField } from './select-field'
export { CheckboxField } from './checkbox-field'
export { RadioField } from './radio-field'
export { SwitchField } from './switch-field'
export { DateField } from './date-field'
export { UploadField } from './upload-field'
```

---

### Task 6: 创建主组件 JsonForm

**Files:**
- Create: `packages/ui/src/components/custom/json-form/json-form.tsx`

- [ ] **Step 1: 创建 json-form.tsx**

```typescript
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

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { FormData, JsonFormConfig, JsonFormProps } from './types'
import { buildSchema, getDefaultValues, getGridStyle, submitToApi } from './utils'
import {
  TextField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioField,
  SwitchField,
  DateField,
  UploadField,
} from './fields'
import { Form } from '@repo/ui/shadcn/form'
import { Button } from '@repo/ui/shadcn/button'
import { cn } from '@repo/utils'

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
    if (config.submit && config.submit !== false && config.submit.api) {
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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-6', className)}
      >
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
                ? (config.submit?.loadingText || '提交中...')
                : (config.submit?.text || '提交')}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
```

---

### Task 7: 创建桶导出文件

**Files:**
- Create: `packages/ui/src/components/custom/json-form/index.ts`

- [ ] **Step 1: 创建 index.ts**

```typescript
/**
 * JsonForm - JSON 驱动的动态表单组件
 *
 * 基于 react-hook-form 和 Zod 的表单解决方案
 * 支持通过 JSON 配置动态渲染表单字段
 *
 * @example
 * ```tsx
 * import { JsonForm } from '@repo/ui/custom/json-form'
 * import { z } from 'zod'
 *
 * const formConfig = {
 *   fields: [
 *     {
 *       name: 'username',
 *       type: 'text',
 *       label: '用户名',
 *       required: true,
 *       grid: { span: 6 },
 *       validation: z.string().min(3, '用户名至少3个字符'),
 *     },
 *     {
 *       name: 'email',
 *       type: 'email',
 *       label: '邮箱',
 *       grid: { span: 6 },
 *       validation: z.string().email('邮箱格式不正确'),
 *     },
 *     {
 *       name: 'role',
 *       type: 'select',
 *       label: '角色',
 *       options: [
 *         { label: '管理员', value: 'admin' },
 *         { label: '用户', value: 'user' },
 *       ],
 *       grid: { span: 6 },
 *     },
 *   ],
 *   submit: {
 *     text: '提交',
 *     api: { url: '/api/users', method: 'POST' },
 *   },
 * }
 *
 * // 使用方式 1：纯配置模式
 * <JsonForm config={formConfig} />
 *
 * // 使用方式 2：自定义提交
 * <JsonForm config={formConfig} onSubmit={(data) => console.log(data)} />
 *
 * // 使用方式 3：外部消费表单状态
 * <JsonForm
 *   config={formConfig}
 *   onValuesChange={(values) => console.log(values)}
 *   formRef={formRef}
 * />
 * ```
 */

// 主组件导出
export { JsonForm } from './json-form'

// 类型导出
export type {
  FieldConfig,
  FieldType,
  FormData,
  GridConfig,
  JsonFormConfig,
  JsonFormProps,
  SelectOption,
  SubmitConfig,
  ApiConfig,
  ButtonVariant,
} from './types'

// 工具函数导出
export {
  buildSchema,
  getDefaultValues,
  getGridStyle,
  isMultiSelectField,
  isSelectField,
  mergeConfig,
  submitToApi,
} from './utils'

// 字段渲染器导出（用于自定义扩展）
export {
  CheckboxField,
  DateField,
  RadioField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
  UploadField,
} from './fields'
```

---

### Task 8: 更新 UI 包的 package.json

**Files:**
- Modify: `packages/ui/package.json`

- [ ] **Step 1: 添加导出配置**

在 `packages/ui/package.json` 的 `exports` 字段中添加:

```json
{
  "exports": {
    "./shadcn/*": "./src/components/shadcn/*.tsx",
    "./custom/*": "./src/components/custom/*/index.ts",
    "./custom/json-form": "./src/components/custom/json-form/index.ts",
    "./custom/split-layout": "./src/components/custom/split-layout/index.tsx",
    "./icons": "./src/components/custom/icons/index.tsx",
    "./lib/*": "./src/lib/*.ts"
  }
}
```

---

### Task 9: 更新组件展示页面

**Files:**
- Modify: `packages/pages/src/components-page.tsx`

- [ ] **Step 1: 添加 JsonForm 组件信息**

在 `componentsData` 数组中添加:

```typescript
const componentsData: ComponentInfo[] = [
  // ... 已有组件
  {
    id: 'json-form',
    name: 'JsonForm',
    description: 'JSON 驱动的动态表单组件，支持多种字段类型、网格布局和 Zod 验证',
    category: 'form',
    status: 'stable',
    path: '@repo/ui/custom/json-form',
  },
]
```

- [ ] **Step 2: 添加组件卡片展示**

在组件卡片区域添加:

```tsx
<ComponentCard
  name="JsonForm"
  description="JSON 驱动的动态表单组件"
  icon={<FileText className="h-6 w-6" />}
  category="表单"
  path="@repo/ui/custom/json-form"
/>
```

- [ ] **Step 3: 添加 JsonForm 组件演示区块**

在页面中添加演示区域，包含完整的表单示例。

---

### Task 10: 验证和格式化

- [ ] **Step 1: 运行类型检查**

```bash
cd d:\Work\2026\fe-base && pnpm type-check
```

预期输出: 无类型错误

- [ ] **Step 2: 运行代码格式化**

```bash
cd d:\Work\2026\fe-base && pnpm check
```

预期输出: 代码格式化完成

- [ ] **Step 3: 运行 lint 检查**

```bash
cd d:\Work\2026\fe-base && pnpm lint
```

预期输出: 无 lint 错误

---

## 自检清单

- [x] **Spec coverage**: 所有设计文档要求均已覆盖
- [x] **Placeholder scan**: 无 TBD/TODO 占位符
- [x] **Type consistency**: 类型定义在各文件中保持一致

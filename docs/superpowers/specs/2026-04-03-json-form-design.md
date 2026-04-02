# JSON 驱动表单组件设计文档

## 概述

在 `packages/ui` 中新增一个 JSON 驱动的动态表单组件 `JsonForm`，支持通过 JSON 配置渲染各类表单字段，并集成 react-hook-form 和 Zod 进行状态管理和验证。

## 需求总结

- **验证方案**: Zod Schema
- **状态管理**: react-hook-form，支持外部消费表单状态
- **字段类型**: 文本输入、密码、邮箱、数字、文本域、单选、多选、开关、下拉单选/多选、日期时间类、上传组件
- **布局**: 网格布局（支持多列）
- **联动**: 不需要
- **分组**: 不需要
- **shadcn组件**: 自动添加所需基础组件
- **提交**: 支持自定义回调 + 内置提交（可配置API路径和请求方式）

## 组件结构

```
packages/ui/src/components/custom/json-form/
├── index.ts              # 桶导出
├── json-form.tsx         # 主组件
├── types.ts              # 类型定义
├── fields/               # 字段渲染器
│   ├── index.ts
│   ├── text-field.tsx    # 文本/密码/邮箱/数字
│   ├── textarea-field.tsx
│   ├── select-field.tsx  # 下拉单选/多选
│   ├── checkbox-field.tsx
│   ├── radio-field.tsx
│   ├── switch-field.tsx
│   ├── date-field.tsx    # 日期/日期时间
│   └── upload-field.tsx
└── utils.ts              # 工具函数
```

## 核心类型定义

### 字段类型

```typescript
type FieldType = 'text' | 'password' | 'email' | 'number' | 'textarea' 
  | 'select' | 'multi-select' | 'radio' | 'checkbox' | 'switch' 
  | 'date' | 'datetime' | 'upload'
```

### 网格配置

```typescript
interface GridConfig {
  span?: number      // 占用列数 (1-12)
  offset?: number    // 偏移列数
}
```

### 字段配置

```typescript
interface FieldConfig {
  name: string                    // 字段名
  type: FieldType                 // 字段类型
  label?: string                  // 标签
  placeholder?: string            // 占位符
  description?: string            // 描述文字
  required?: boolean              // 是否必填
  disabled?: boolean              // 是否禁用
  grid?: GridConfig               // 网格布局
  defaultValue?: unknown          // 默认值
  options?: Array<{label: string; value: string | number}>  // 选项（select/radio/checkbox）
  validation?: ZodSchema          // Zod 验证规则
  props?: Record<string, unknown> // 传递给基础组件的额外属性
}
```

### 提交配置

```typescript
interface SubmitConfig {
  text?: string                   // 按钮文字
  loadingText?: string            // 加载中文字
  variant?: ButtonVariant         // 按钮样式
  api?: {                         // API 配置
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    headers?: Record<string, string>
    transformData?: (data: FormData) => unknown  // 数据转换
  }
}
```

### 表单配置

```typescript
interface JsonFormConfig {
  fields: FieldConfig[]           // 字段列表
  submit?: SubmitConfig | false   // 提交配置，false 表示不显示提交按钮
  layout?: 'horizontal' | 'vertical'  // 标签布局
  columns?: number                // 网格列数，默认 12
}
```

### 组件 Props

```typescript
interface JsonFormProps {
  config: JsonFormConfig          // 表单配置
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>  // 自定义提交回调
  onValuesChange?: (values: Record<string, unknown>) => void  // 值变化回调
  formRef?: React.MutableRefObject<UseFormReturn | null>  // 表单实例引用
  defaultValues?: Record<string, unknown>  // 默认值
  className?: string              // 自定义类名
}
```

## 组件用法示例

### 基础用法

```tsx
import { JsonForm } from '@repo/ui/custom/json-form'
import { z } from 'zod'

const formConfig: JsonFormConfig = {
  fields: [
    {
      name: 'username',
      type: 'text',
      label: '用户名',
      placeholder: '请输入用户名',
      required: true,
      grid: { span: 6 },
      validation: z.string().min(3, '用户名至少3个字符'),
    },
    {
      name: 'email',
      type: 'email',
      label: '邮箱',
      grid: { span: 6 },
      validation: z.string().email('邮箱格式不正确'),
    },
    {
      name: 'bio',
      type: 'textarea',
      label: '个人简介',
      grid: { span: 12 },
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' },
      ],
      grid: { span: 6 },
    },
    {
      name: 'birthday',
      type: 'date',
      label: '出生日期',
      grid: { span: 6 },
    },
    {
      name: 'avatar',
      type: 'upload',
      label: '头像',
      grid: { span: 12 },
    },
  ],
  submit: {
    text: '提交',
    api: { url: '/api/users', method: 'POST' },
  },
}

// 使用方式 1：纯配置模式（内置API提交）
<JsonForm config={formConfig} />

// 使用方式 2：自定义提交
<JsonForm 
  config={formConfig} 
  onSubmit={(data) => console.log(data)} 
/>

// 使用方式 3：外部消费表单状态
<JsonForm 
  config={formConfig} 
  onValuesChange={(values) => console.log(values)}
  formRef={formRef}
/>
```

## 需要添加的 shadcn 组件

| 组件 | 用途 |
|------|------|
| Input | 文本/密码/邮箱/数字输入 |
| Textarea | 多行文本 |
| Select | 下拉选择 |
| Checkbox | 复选框 |
| RadioGroup | 单选组 |
| Switch | 开关 |
| Label | 标签 |
| Form | 表单容器（配合 react-hook-form）|

## 新增依赖

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  }
}
```

## 实现步骤

1. 添加 shadcn/ui 基础组件
2. 安装依赖包（react-hook-form, zod, @hookform/resolvers）
3. 创建类型定义文件 types.ts
4. 实现各字段渲染组件
5. 实现主组件 json-form.tsx
6. 创建桶导出文件 index.ts
7. 更新 UI 包的 package.json 导出配置
8. 在 components-page.tsx 中添加组件展示

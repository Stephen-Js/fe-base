# AI Agent 开发规范指南

本文档用于指导 AI 助手在分析和生成代码时遵循项目规范，确保代码质量和一致性。

## 项目概览

这是一个基于 **pnpm workspace + Turborepo** 的 Monorepo 项目，支持多端应用开发：

- **Web**: Next.js 应用 (`apps/web`)
- **Desktop**: Tauri 桌面应用 (`apps/desktop`)
- **Mobile**: Expo/React Native 应用 (`apps/mobile`)
- **共享包**: 位于 `packages/` 目录下

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19.1.0 |
| 语言 | TypeScript (strict mode) |
| 样式 | Tailwind CSS |
| 构建工具 | Turborepo |
| 包管理 | pnpm 9.15.0 |
| 代码检查 | Biome + ESLint |
| Git Hooks | Lefthook |

## 代码风格规范

### 基本格式

```typescript
// ✅ 正确示例
import type { ReactNode } from 'react'
import { useState } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  )
}
```

### 格式化规则

| 规则 | 配置 |
|------|------|
| 引号 | 单引号 `'` |
| 缩进 | 2 空格 |
| 行宽 | 100 字符 |
| 尾随逗号 | ES5 模式 |
| 分号 | 按需添加 (asNeeded) |

### TypeScript 规范

```typescript
// ✅ 类型导入使用 type 关键字
import type { Config } from 'tailwindcss'

// ✅ 使用 interface 定义对象类型
interface User {
  id: string
  name: string
}

// ✅ 使用 type 定义联合类型、工具类型
type Status = 'pending' | 'success' | 'error'
type UserPartial = Partial<User>

// ✅ 未使用的参数以 _ 开头
function handleChange(_event: Event, value: string) {
  console.log(value)
}

// ✅ 使用严格类型检查
const items = ['a', 'b', 'c']
const item = items[0] // 类型为 string | undefined
```

### React 组件规范

```tsx
// ✅ 函数组件，使用 export function
export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <span>{user.name}</span>
      <button type="button" onClick={() => setIsOpen(true)}>
        编辑
      </button>
    </div>
  )
}

// ✅ 客户端组件在文件顶部添加 'use client'
'use client'

import { useState } from 'react'
// ...
```

### 组件库使用规范

本项目使用 **shadcn/ui** 作为基础组件库。创建自定义组件时，必须遵循以下原则：

```tsx
// ✅ 正确：使用 shadcn/ui 组件
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'

export function SearchForm() {
  return (
    <form className="flex gap-2">
      <Input placeholder="输入关键词" />
      <Button type="submit">搜索</Button>
    </form>
  )
}

// ❌ 错误：手动实现基础组件
export function SearchForm() {
  return (
    <form className="flex gap-2">
      <input className="..." placeholder="输入关键词" />  {/* 应使用 Input 组件 */}
      <button className="..." type="submit">搜索</button>  {/* 应使用 Button 组件 */}
    </form>
  )
}
```

**shadcn/ui 常用组件清单：**

| 组件 | 用途 |
|------|------|
| Button | 按钮 |
| Input | 输入框 |
| Textarea | 多行文本输入 |
| Select | 下拉选择 |
| Checkbox | 复选框 |
| RadioGroup | 单选组 |
| Switch | 开关 |
| Dialog | 对话框 |
| Sheet | 侧边抽屉 |
| DropdownMenu | 下拉菜单 |
| Tabs | 标签页 |
| Card | 卡片 |
| Table | 表格 |
| Form | 表单（配合 react-hook-form）|
| Toast | 提示消息 |
| AlertDialog | 确认对话框 |
| Popover | 弹出层 |
| Tooltip | 工具提示 |

**添加新组件：**

```bash
# 使用项目脚本添加组件
pnpm ui:add <component-name>

# 示例：添加 dialog 组件
pnpm ui:add dialog
```

**组件展示页面维护：**

在 `packages/ui` 中创建新的**自定义组件**（非 shadcn 原始组件）后，必须在组件展示页面中添加对应的展示内容：

```tsx
// 文件位置: packages/pages/src/components-page.tsx

// 1. 在 componentsData 数组中添加组件信息
const componentsData: ComponentInfo[] = [
  // ... 已有组件
  {
    id: 'new-component',           // 组件 ID
    name: 'NewComponent',           // 组件名称
    description: '组件功能描述',     // 简要描述
    category: 'layout',             // 分类: layout | data | form | feedback | navigation
    status: 'stable',               // 状态: stable | beta | deprecated
    path: '@repo/ui/custom/new-component',  // 引入路径
  },
]

// 2. 在组件卡片区域添加卡片展示
<ComponentCard
  name="NewComponent"
  description="组件功能描述"
  icon={<NewIcon className="h-6 w-6" />}
  category="布局"
  path="@repo/ui/custom/new-component"
/>

// 3. 如有交互演示，添加独立演示区块
<div className="mb-12">
  <h2 className="mb-4 text-xl font-semibold">NewComponent 组件</h2>
  <div className="space-y-6 rounded-lg border border-border bg-card p-6">
    {/* 组件演示内容 */}
  </div>
</div>
```

**豁免情况：**

- shadcn 原始组件（`@repo/ui/shadcn/*`）无需单独展示
- 纯工具函数、类型定义无需展示
- 内部辅助组件无需展示

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UserProfile`, `SidebarContent` |
| 函数/变量 | camelCase | `getUserData`, `isActive` |
| 常量 | SCREAMING_SNAKE_CASE | `API_URL`, `MAX_RETRIES` |
| 文件名 | kebab-case | `user-profile.tsx`, `data-table.tsx` |
| 工具函数文件 | kebab-case | `format-date.ts` |
| 类型文件 | kebab-case | `user-types.ts` |

### Tailwind CSS 规范

```tsx
// ✅ 类名按逻辑分组，使用模板字符串
<div className="flex h-screen flex-col items-center justify-center">
  <h1 className="text-4xl font-bold">标题</h1>
</div>

// ✅ 条件类名使用模板字符串
<button
  type="button"
  className={`px-4 py-2 rounded-md ${
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'bg-secondary text-secondary-foreground'
  }`}
>
  按钮
</button>

// ✅ 对于复杂条件，考虑使用 clsx 或 cn 工具函数
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class', className)}>
```

## 项目结构规范

```
fe-base/
├── apps/                    # 应用目录
│   ├── web/                 # Next.js Web 应用
│   ├── desktop/             # Tauri 桌面应用
│   └── mobile/              # Expo 移动应用
├── packages/                # 共享包
│   ├── ui/                  # 共享 UI 组件库
│   ├── ui-native/           # React Native UI 组件
│   ├── ui-tokens/           # 设计令牌
│   ├── api/                 # API 相关
│   ├── hooks/               # 共享 Hooks
│   ├── i18n/                # 国际化
│   ├── pages/               # 共享页面
│   ├── services/            # 服务层
│   ├── store/               # 状态管理
│   ├── types/               # 共享类型定义
│   └── utils/               # 工具函数
├── tooling/                 # 工具配置
│   ├── eslint-config/       # ESLint 配置
│   ├── tailwind-config/     # Tailwind 配置
│   └── typescript-config/   # TypeScript 配置
└── scripts/                 # 脚本文件
```

### 目录组织规范

创建新模块时，应按照以下规则选择正确的目录：

| 模块类型 | 目录 | 说明 |
|----------|------|------|
| 通用 UI 组件 | `packages/ui/src/components/` | 可在 Web 和 Desktop 复用 |
| Native 组件 | `packages/ui-native/src/` | React Native 专用组件 |
| 设计令牌 | `packages/ui-tokens/` | 颜色、间距、字体等变量 |
| 自定义 Hooks | `packages/hooks/src/` | 可复用的 React Hooks |
| API 请求 | `packages/api/src/` | 接口定义、请求封装 |
| 业务服务 | `packages/services/src/` | 业务逻辑封装 |
| 全局状态 | `packages/store/src/` | Zustand/Jotai 等 store |
| 类型定义 | `packages/types/src/` | 共享的 TypeScript 类型 |
| 工具函数 | `packages/utils/src/` | 通用工具函数 |
| 国际化 | `packages/i18n/src/` | 多语言文案 |
| 应用页面 | `apps/web/src/app/` | Next.js 页面路由 |
| 应用组件 | `apps/web/src/components/` | Web 应用专用组件 |

**决策流程：**

```
新模块 → 是否 UI 组件？ → 是否仅 Mobile？ → 选择对应目录
                    ↓                    ↓
                  是                    是 → packages/ui-native/
                    ↓                    ↓
                多端复用？              否
                    ↓                    ↓
            是 → packages/ui/      否 → packages/ui/
            否 → apps/{app}/src/components/
```

## Next.js 约定式路由规范

Web 应用 (`apps/web`) 使用 Next.js App Router，遵循文件系统路由约定。

### 路由文件约定

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `page.tsx` | 页面组件 | 定义路由页面，必需 |
| `layout.tsx` | 布局组件 | 共享布局，子路由会嵌套其中 |
| `loading.tsx` | 加载状态 | Suspense 加载 UI |
| `error.tsx` | 错误处理 | 错误边界组件 |
| `not-found.tsx` | 404 页面 | 未找到页面 |
| `route.ts` | API 路由 | 后端 API 端点 |
| `middleware.ts` | 中间件 | 请求拦截处理 |

### 目录结构示例

```
apps/web/src/app/
├── layout.tsx              # 根布局
├── page.tsx                # 首页 /
├── globals.css             # 全局样式
├── components/             # 应用级组件
│   └── sidebar-content.tsx
├── users/                  # /users 路由
│   ├── page.tsx            # /users 列表页
│   ├── layout.tsx          # users 布局
│   └── [id]/               # 动态路由 /users/:id
│       ├── page.tsx        # 用户详情页
│       └── edit/
│           └── page.tsx    # 编辑页 /users/:id/edit
├── (auth)/                 # 路由组（不影响 URL）
│   ├── login/
│   │   └── page.tsx        # /login
│   └── register/
│       └── page.tsx        # /register
└── api/                    # API 路由
    └── users/
        └── route.ts        # /api/users
```

### 路由规则

```typescript
// ✅ 静态路由
// app/users/page.tsx → /users

// ✅ 动态路由
// app/users/[id]/page.tsx → /users/:id
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>User ID: {params.id}</div>
}

// ✅ 动态路由段
// app/shop/[...slug]/page.tsx → /shop/*
// 匹配 /shop/clothes, /shop/clothes/tops 等

// ✅ 路由组（括号包裹，不参与 URL）
// app/(marketing)/about/page.tsx → /about
// app/(marketing)/pricing/page.tsx → /pricing
```

### 布局嵌套规则

```tsx
// app/layout.tsx - 根布局（必需）
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

// app/users/layout.tsx - users 布局
export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <nav>侧边栏</nav>
      <main>{children}</main>
    </div>
  )
}
```

### 注意事项

- **`page.tsx` 必须默认导出组件**：`export default function Page() {}`
- **布局不能是客户端组件**：除非有交互需求，否则保持服务端组件
- **使用 `'use client'` 标记客户端组件**：放在文件最顶部
- **避免在 `app/` 目录外创建路由**：路由文件必须放在 `app/` 目录下
- **路由文件使用 kebab-case 命名**：`user-profile/page.tsx`

## 导入路径规范

```typescript
// ✅ 使用 @repo 别名导入共享包
import { Button } from '@repo/ui'
import { useAuth } from '@repo/hooks'
import type { User } from '@repo/types'

// ✅ 使用 @/ 别名导入应用内部模块
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
```

## 桶导出模式规范

每个模块目录应包含 `index.ts` 桶导出文件，统一管理模块的导出内容。

### 基本结构

```
packages/ui/src/components/custom/data-table/
├── index.ts           # 桶导出文件
├── data-table.tsx     # 主组件
├── types.ts           # 类型定义
├── toolbar.tsx        # 子组件
├── cell-renderer.tsx  # 子组件
└── utils.ts           # 工具函数
```

### 导出规范

```typescript
// ✅ 组件导出
export { DataTable } from './data-table'

// ✅ 子组件导出（带重命名前缀，避免命名冲突）
export {
  ActionButton as DataTableActionButton,
  Cell,
  useCellRenderer,
} from './cell-renderer'

// ✅ 类型导出（使用 type 关键字）
export type { DataTableProps } from './data-table'
export type { ColumnConfig, TableState } from './types'

// ✅ 工具函数导出
export { cn, formatDate, sortData } from './utils'
```

### 导出顺序

```typescript
/**
 * DataTable - 通用表格组件
 *
 * 组件描述和使用示例
 */

// 1. 主组件导出
export { DataTable } from './data-table'

// 2. 子组件导出
export { Pagination, TableToolbar } from './toolbar'

// 3. 类型导出
export type { DataTableProps, ColumnConfig } from './types'

// 4. 工具函数导出
export { cn, formatDate } from './utils'
```

### 命名冲突处理

```typescript
// ✅ 使用 as 重命名避免冲突
export { Button as DataTableButton } from './button'
export { Input as DataTableInput } from './input'

// ✅ 或使用命名空间对象导出
export const dataTable = {
  Button: DataTableButton,
  Input: DataTableInput,
}
```

### 包级桶导出

```typescript
// packages/ui/src/index.ts

// 从子目录桶导出
export { Button, Input, Select } from './components/shadcn'
export { DataTable } from './components/custom/data-table'
export { modal, Modal, ConfirmModal } from './components/custom/modal'

// 工具函数
export { cn } from './lib/utils'
```

## 开发工作流

### 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev              # 所有应用
pnpm dev:web          # Web 应用
pnpm dev:pc           # 桌面应用
pnpm dev:mobile       # 移动应用

# 构建
pnpm build

# 代码检查
pnpm lint             # ESLint 检查
pnpm type-check       # TypeScript 类型检查
pnpm check            # Biome 格式化检查

# 设计令牌和图标
pnpm build:tokens     # 构建设计令牌
pnpm build:icons      # 生成图标组件
```

### 提交代码前

1. 运行 `pnpm lint` 确保无 lint 错误
2. 运行 `pnpm type-check` 确保类型正确
3. 运行 `pnpm check` 自动修复格式问题

## 注释规范

### 注释语言

- **代码注释使用中文**，便于团队理解和维护
- **变量/函数命名使用英文**，遵循编程惯例

### 注释风格

```typescript
// ✅ 单行注释：说明复杂逻辑
function calculateTotal(items: Item[]) {
  // 过滤掉无效的商品项
  const validItems = items.filter((item) => item.price > 0)
  return validItems.reduce((sum, item) => sum + item.price, 0)
}

// ✅ 多行注释：说明函数用途和参数
/**
 * 格式化日期为指定格式
 * @param date - 日期对象或时间戳
 * @param format - 目标格式，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number, format = 'YYYY-MM-DD'): string {
  // ...
}

// ✅ TODO 注释：标记待办事项
// TODO: 添加错误重试机制
// FIXME: 处理边界情况
// HACK: 临时方案，需要优化
```

### 组件注释

```tsx
// ✅ 复杂组件添加说明注释
/**
 * 用户资料卡片组件
 * 用于展示用户头像、名称和基本信息
 */
export function UserProfileCard({ user, onEdit }: UserProfileCardProps) {
  // ...
}

// ✅ 简单组件可省略注释，让代码自解释
export function Divider() {
  return <hr className="border-border" />
}
```

### 注释原则

- **不要注释显而易见的内容**：`let count = 0 // 初始化计数` ❌
- **注释「为什么」而非「是什么」**：解释设计决策和业务原因
- **保持注释与代码同步**：修改代码时更新相关注释
- **使用 TODO/FIXME 标记**：便于追踪待处理项

## AI 代码生成原则

### 优先原则

1. **优先编辑现有文件**，而非创建新文件
2. **优先使用项目已有的依赖**，避免添加新依赖
3. **优先使用共享包** (`@repo/*`) 中的组件和工具

### 代码生成步骤

1. **理解上下文**: 阅读相关文件，了解现有代码结构
2. **遵循规范**: 按照本文档的代码风格生成代码
3. **保持一致**: 与项目现有代码风格保持一致
4. **类型安全**: 确保所有类型定义正确、完整

### 禁止事项

- ❌ 不要创建 `.md` 文档文件（除非用户明确要求）
- ❌ 不要在代码中添加行号前缀
- ❌ 不要使用 `var` 声明变量
- ❌ 不要使用 `any` 类型（特殊情况使用 `unknown`）
- ❌ 不要在组件内部定义其他组件

### 必须事项

- ✅ 为新组件添加 TypeScript 类型定义
- ✅ 使用单引号字符串
- ✅ 为复杂逻辑添加简洁的注释
- ✅ 确保代码可通过 `pnpm lint` 和 `pnpm type-check`

## 错误处理规范

```typescript
// ✅ 使用 try-catch 处理异步操作
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}

// ✅ 为可能为 undefined 的值添加默认值
const items = data?.items ?? []
const name = user?.name ?? 'Anonymous'
```

## 测试规范

- 测试文件命名：`*.test.ts` 或 `*.spec.ts`
- 测试文件位置：与源文件同目录或 `__tests__` 目录
- 测试框架：根据项目配置使用

---

**注意**: 本文档会随项目演进持续更新。如有疑问，请参考项目现有代码的实现方式。

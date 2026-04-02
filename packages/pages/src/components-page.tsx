/**
 * 组件展示页面
 * 展示 @repo/ui 共享组件库中的组件
 */

'use client'

import { type ActionsConfig, type ColumnConfig, DataTable } from '@repo/ui/custom/data-table'
import { JsonForm, type JsonFormConfig } from '@repo/ui/custom/json-form'
import { modal, NiceModal } from '@repo/ui/custom/modal'
import { buttonVariants } from '@repo/ui/shadcn/button'
import {
  Bell,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Settings,
  Table2,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'

// 组件信息类型
interface ComponentInfo {
  id: string
  name: string
  description: string
  category: 'layout' | 'data' | 'form' | 'feedback' | 'navigation'
  status: 'stable' | 'beta' | 'deprecated'
  path: string
  [key: string]: string
}

// 组件数据
const componentsData: ComponentInfo[] = [
  {
    id: 'split-layout',
    name: 'SplitLayout',
    description: '可折叠的分栏布局组件，支持左右分栏和侧边栏折叠功能',
    category: 'layout',
    status: 'stable',
    path: '@repo/ui/custom/split-layout',
  },
  {
    id: 'data-table',
    name: 'DataTable',
    description: '基于 JSON 配置的通用表格组件，支持排序、筛选、分页等功能',
    category: 'data',
    status: 'stable',
    path: '@repo/ui/custom/data-table',
  },
  {
    id: 'button',
    name: 'Button',
    description: '按钮组件，支持多种变体和尺寸',
    category: 'form',
    status: 'stable',
    path: '@repo/ui/shadcn/button',
  },
  {
    id: 'modal',
    name: 'Modal',
    description: '函数式弹窗组件，基于 nice-modal-react 封装，支持 Promise 调用',
    category: 'feedback',
    status: 'stable',
    path: '@repo/ui/custom/modal',
  },
  {
    id: 'json-form',
    name: 'JsonForm',
    description: 'JSON 驱动的动态表单组件，支持多种字段类型、网格布局和 Zod 验证',
    category: 'form',
    status: 'stable',
    path: '@repo/ui/custom/json-form',
  },
]

// 状态映射配置
const statusBadgeConfig = {
  mapping: [
    { value: 'stable', label: '稳定', variant: 'default' as const },
    { value: 'beta', label: '测试中', variant: 'outline' as const },
    { value: 'deprecated', label: '已废弃', variant: 'secondary' as const },
  ],
}

// 分类映射配置
const categoryBadgeConfig = {
  mapping: [
    { value: 'layout', label: '布局', variant: 'default' as const },
    { value: 'data', label: '数据', variant: 'secondary' as const },
    { value: 'form', label: '表单', variant: 'outline' as const },
    { value: 'feedback', label: '反馈', variant: 'outline' as const },
    { value: 'navigation', label: '导航', variant: 'outline' as const },
  ],
}

// 列配置
const columns: ColumnConfig[] = [
  {
    id: 'name',
    header: '组件名称',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'description',
    header: '描述',
    accessor: 'description',
  },
  {
    id: 'category',
    header: '分类',
    accessor: 'category',
    cellRenderer: {
      type: 'badge',
      badgeConfig: categoryBadgeConfig,
    },
    align: 'center',
  },
  {
    id: 'status',
    header: '状态',
    accessor: 'status',
    cellRenderer: {
      type: 'badge',
      badgeConfig: statusBadgeConfig,
    },
    align: 'center',
  },
  {
    id: 'path',
    header: '引入路径',
    accessor: 'path',
  },
]

// 操作列配置
const actions: ActionsConfig = {
  id: 'actions',
  header: '操作',
  fixed: 'right',
  buttons: [
    {
      id: 'view',
      label: '查看',
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline',
      onClick: (row) => console.log('查看', row),
    },
    {
      id: 'edit',
      label: '编辑',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'ghost',
      onClick: (row) => console.log('编辑', row),
    },
  ],
}

// 组件卡片 Props
interface ComponentCardProps {
  name: string
  description: string
  icon: React.ReactNode
  category: string
  path: string
}

// 组件卡片组件
function ComponentCard({ name, description, icon, category, path }: ComponentCardProps) {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="font-semibold">{name}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {category}
        </span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <code className="block rounded bg-muted p-2 text-xs text-muted-foreground">{path}</code>
    </div>
  )
}

// 快速上手示例组件
function QuickStartExample() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">基础用法</h3>
        <p className="mb-4 text-sm text-muted-foreground">引入组件并传递数据即可快速使用</p>
        <div className="rounded-lg border border-border bg-card p-4">
          <pre className="text-sm">
            {`import { DataTable } from '@repo/ui/custom/data-table'
import { Button } from '@repo/ui/shadcn/button'

const columns = [
  { id: 'name', header: '姓名', accessor: 'name' },
  { id: 'status', header: '状态', accessor: 'status' },
]

<DataTable data={users} columns={columns} />`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">JSON 配置示例</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          通过 JSON 配置定义表格字段，无需编写渲染代码
        </p>
        <div className="rounded-lg border border-border bg-card p-4">
          <pre className="text-sm">
            {`const columns = [
  {
    id: 'name',
    header: '姓名',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'status',
    header: '状态',
    accessor: 'status',
    cellRenderer: {
      type: 'badge',
      badgeConfig: {
        mapping: [
          { value: 'active', label: '激活', variant: 'default' },
          { value: 'inactive', label: '未激活', variant: 'secondary' },
        ],
      },
    },
  },
]`}
          </pre>
        </div>
      </div>
    </div>
  )
}

/**
 * 组件展示页面
 * 可在 web 和 desktop 应用中共享使用
 */
export function ComponentsPage() {
  return (
    <div className="container mx-auto py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">组件库</h1>
        <p className="mt-2 text-muted-foreground">
          基于 shadcn/ui 和 Tailwind CSS 的 React 组件库，支持 JSON 配置化
        </p>
      </div>

      {/* 组件统计卡片 */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{componentsData.length}</p>
              <p className="text-sm text-muted-foreground">组件总数</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {componentsData.filter((c) => c.status === 'stable').length}
              </p>
              <p className="text-sm text-muted-foreground">稳定版本</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Bell className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {componentsData.filter((c) => c.status === 'beta').length}
              </p>
              <p className="text-sm text-muted-foreground">测试版本</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Table2 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">组件分类</p>
            </div>
          </div>
        </div>
      </div>

      {/* 组件表格 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">组件列表</h2>
        <div className="rounded-lg border border-border bg-card">
          <DataTable
            data={componentsData}
            columns={columns}
            actions={actions}
            pagination={{
              show: true,
              defaultPageSize: 10,
              showTotal: true,
            }}
            toolbar={{
              search: { show: true, placeholder: '搜索组件...' },
              columnSettings: { show: true },
            }}
          />
        </div>
      </div>

      {/* 组件卡片展示 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">组件卡片</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ComponentCard
            name="SplitLayout"
            description="可折叠的分栏布局组件，支持侧边栏折叠功能"
            icon={<LayoutDashboard className="h-6 w-6" />}
            category="布局"
            path="@repo/ui/custom/split-layout"
          />
          <ComponentCard
            name="DataTable"
            description="基于 JSON 配置的通用表格组件"
            icon={<Table2 className="h-6 w-6" />}
            category="数据"
            path="@repo/ui/custom/data-table"
          />
          <ComponentCard
            name="Button"
            description="按钮组件，支持多种变体和尺寸"
            icon={<Plus className="h-6 w-6" />}
            category="表单"
            path="@repo/ui/shadcn/button"
          />
          <ComponentCard
            name="Modal"
            description="函数式弹窗组件，支持 Promise 调用"
            icon={<MessageSquare className="h-6 w-6" />}
            category="反馈"
            path="@repo/ui/custom/modal"
          />
          <ComponentCard
            name="JsonForm"
            description="JSON 驱动的动态表单组件"
            icon={<FileText className="h-6 w-6" />}
            category="表单"
            path="@repo/ui/custom/json-form"
          />
        </div>
      </div>

      {/* Modal 弹窗组件展示 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Modal 弹窗组件</h2>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          {/* 基础确认弹窗 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">确认弹窗</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonVariants({ variant: 'default' })}
                onClick={() => {
                  modal
                    .confirm({
                      title: '确认操作',
                      description: '确定要执行此操作吗？',
                      confirmText: '确定',
                      cancelText: '取消',
                    })
                    .then((result) => {
                      console.log('弹窗结果:', result)
                    })
                }}
              >
                基础确认弹窗
              </button>
              <button
                type="button"
                className={buttonVariants({ variant: 'destructive' })}
                onClick={() => {
                  modal
                    .confirm({
                      title: '删除确认',
                      description: '此操作不可撤销，确定要删除该项吗？',
                      confirmText: '删除',
                      confirmVariant: 'destructive',
                      cancelText: '取消',
                    })
                    .then((result) => {
                      console.log('删除结果:', result)
                    })
                }}
              >
                删除确认弹窗
              </button>
            </div>
          </div>

          {/* 异步操作弹窗 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">异步操作</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonVariants({ variant: 'outline' })}
                onClick={() => {
                  modal.confirm({
                    title: '提交数据',
                    description: '正在提交数据，请稍候...',
                    confirmText: '提交',
                    confirmLoading: true,
                    onConfirm: async () => {
                      await new Promise((resolve) => setTimeout(resolve, 2000))
                      console.log('提交完成')
                    },
                  })
                }}
              >
                异步提交弹窗
              </button>
            </div>
          </div>

          {/* 自定义内容弹窗 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">自定义内容</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonVariants({ variant: 'secondary' })}
                onClick={() => {
                  modal.confirm({
                    title: '自定义内容',
                    content: (
                      <div className="space-y-2">
                        <p className="text-sm">这是一段自定义的内容区域。</p>
                        <ul className="list-inside list-disc text-sm text-muted-foreground">
                          <li>支持任意 React 节点</li>
                          <li>可以包含表单、图片等</li>
                          <li>完全灵活的布局</li>
                        </ul>
                      </div>
                    ),
                    confirmText: '知道了',
                    showCancel: false,
                  })
                }}
              >
                自定义内容弹窗
              </button>
              <button
                type="button"
                className={buttonVariants({ variant: 'ghost' })}
                onClick={() => {
                  modal.confirm({
                    title: '不可关闭',
                    description: '此弹窗不能通过点击遮罩关闭',
                    closable: false,
                    confirmText: '强制确认',
                  })
                }}
              >
                禁止遮罩关闭
              </button>
            </div>
          </div>

          {/* 使用示例代码 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">使用示例</h3>
            <div className="rounded bg-muted p-4">
              <pre className="text-xs">{`import { modal, NiceModal } from '@repo/ui/custom/modal'

// 1. 在应用根节点包裹 Provider
function App() {
  return (
    <NiceModal.Provider>
      <YourApp />
    </NiceModal.Provider>
  )
}

// 2. 调用确认弹窗
const result = await modal.confirm({
  title: '确认删除',
  description: '此操作不可撤销',
  confirmText: '删除',
  confirmVariant: 'destructive',
})
// result 为 true 表示确认，false 表示取消

// 3. 异步操作
await modal.confirm({
  title: '提交中...',
  onConfirm: async () => {
    await submitData()
  },
})`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* JsonForm 表单组件展示 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">JsonForm 表单组件</h2>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          {/* 表单演示 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">用户信息表单</h3>
            <JsonForm
              config={{
                fields: [
                  {
                    name: 'username',
                    type: 'text',
                    label: '用户名',
                    placeholder: '请输入用户名',
                    required: true,
                    grid: { span: 6 },
                  },
                  {
                    name: 'email',
                    type: 'email',
                    label: '邮箱',
                    placeholder: '请输入邮箱',
                    grid: { span: 6 },
                  },
                  {
                    name: 'phone',
                    type: 'text',
                    label: '手机号',
                    placeholder: '请输入手机号',
                    grid: { span: 6 },
                  },
                  {
                    name: 'birthday',
                    type: 'date',
                    label: '出生日期',
                    grid: { span: 6 },
                  },
                  {
                    name: 'role',
                    type: 'select',
                    label: '角色',
                    options: [
                      { label: '管理员', value: 'admin' },
                      { label: '普通用户', value: 'user' },
                      { label: '访客', value: 'guest' },
                    ],
                    grid: { span: 6 },
                  },
                  {
                    name: 'status',
                    type: 'switch',
                    label: '启用状态',
                    grid: { span: 6 },
                    defaultValue: true,
                  },
                  {
                    name: 'bio',
                    type: 'textarea',
                    label: '个人简介',
                    placeholder: '请输入个人简介',
                    grid: { span: 12 },
                  },
                ],
                submit: {
                  text: '提交',
                },
              }}
              onSubmit={(data) => {
                console.log('表单数据:', data)
                alert(JSON.stringify(data, null, 2))
              }}
            />
          </div>

          {/* 更多字段类型 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">更多字段类型</h3>
            <JsonForm
              config={{
                fields: [
                  {
                    name: 'gender',
                    type: 'radio',
                    label: '性别',
                    options: [
                      { label: '男', value: 'male' },
                      { label: '女', value: 'female' },
                    ],
                    grid: { span: 6 },
                  },
                  {
                    name: 'agreed',
                    type: 'checkbox',
                    label: '同意用户协议',
                    grid: { span: 6 },
                  },
                ],
                submit: false,
              }}
              onValuesChange={(values) => console.log('值变化:', values)}
            />
          </div>

          {/* 使用示例代码 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">使用示例</h3>
            <div className="rounded bg-muted p-4">
              <pre className="text-xs">{`import { JsonForm } from '@repo/ui/custom/json-form'
import { z } from 'zod'

const formConfig = {
  fields: [
    {
      name: 'username',
      type: 'text',
      label: '用户名',
      required: true,
      grid: { span: 6 },
      validation: z.string().min(3, '用户名至少3个字符'),
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
  ],
  submit: {
    text: '提交',
    api: { url: '/api/users', method: 'POST' },
  },
}

// 自定义提交
<JsonForm config={formConfig} onSubmit={(data) => console.log(data)} />

// 外部消费表单状态
<JsonForm
  config={formConfig}
  onValuesChange={(values) => console.log(values)}
  formRef={formRef}
/>`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* 组件使用示例 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">快速上手</h2>
        <QuickStartExample />
      </div>

      {/* 按钮组件展示 */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Button 组件变体</h2>
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          {/* 变体展示 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">变体 (Variants)</h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonVariants({ variant: 'default' })}>
                Default
              </button>
              <button type="button" className={buttonVariants({ variant: 'secondary' })}>
                Secondary
              </button>
              <button type="button" className={buttonVariants({ variant: 'destructive' })}>
                Destructive
              </button>
              <button type="button" className={buttonVariants({ variant: 'outline' })}>
                Outline
              </button>
              <button type="button" className={buttonVariants({ variant: 'ghost' })}>
                Ghost
              </button>
              <button type="button" className={buttonVariants({ variant: 'link' })}>
                Link
              </button>
            </div>
          </div>

          {/* 尺寸展示 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">尺寸 (Sizes)</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={buttonVariants({ size: 'default' })}>
                Default
              </button>
              <button type="button" className={buttonVariants({ size: 'sm' })}>
                Small
              </button>
              <button type="button" className={buttonVariants({ size: 'lg' })}>
                Large
              </button>
              <button type="button" className={buttonVariants({ size: 'icon' })}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 带图标 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">带图标</h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonVariants({})}>
                <Plus className="h-4 w-4" />
                添加
              </button>
              <button type="button" className={buttonVariants({ variant: 'outline' })}>
                <Search className="h-4 w-4" />
                搜索
              </button>
              <button type="button" className={buttonVariants({ variant: 'secondary' })}>
                <Settings className="h-4 w-4" />
                设置
              </button>
              <button type="button" className={buttonVariants({ variant: 'destructive' })}>
                <Trash2 className="h-4 w-4" />
                删除
              </button>
            </div>
          </div>

          {/* 禁用状态 */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">禁用状态</h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonVariants({})} disabled>
                Default Disabled
              </button>
              <button type="button" className={buttonVariants({ variant: 'outline' })} disabled>
                Outline Disabled
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 图标展示区 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">常用图标</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid grid-cols-6 gap-4 md:grid-cols-8 lg:grid-cols-12">
            {[
              { icon: Home, name: 'Home' },
              { icon: User, name: 'User' },
              { icon: Bell, name: 'Bell' },
              { icon: Calendar, name: 'Calendar' },
              { icon: Search, name: 'Search' },
              { icon: Settings, name: 'Settings' },
              { icon: Plus, name: 'Plus' },
              { icon: Pencil, name: 'Pencil' },
              { icon: Trash2, name: 'Trash2' },
              { icon: Eye, name: 'Eye' },
              { icon: CheckCircle, name: 'CheckCircle' },
              { icon: XCircle, name: 'XCircle' },
            ].map(({ icon: Icon, name }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                title={name}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 表格表单联动场景展示页面
 * 展示表格操作栏编辑按钮点击后弹窗显示表单的场景
 */

'use client'

import {
  type ActionsConfig,
  type ColumnConfig,
  DataTable,
  type RowData,
} from '@repo/ui/custom/data-table'
import { JsonForm, type JsonFormConfig } from '@repo/ui/custom/json-form'
import { modal } from '@repo/ui/custom/modal'
import { Code2, Pencil } from 'lucide-react'
import { useState } from 'react'

// 用户数据类型
interface UserInfo {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive'
  createdAt: string
  [key: string]: string | undefined
}

// 模拟用户数据
const initialUsersData: UserInfo[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    role: 'guest',
    status: 'active',
    createdAt: '2024-03-25',
  },
  {
    id: '5',
    name: '孙七',
    email: 'sunqi@example.com',
    phone: '13800138005',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-04-01',
  },
]

// 角色映射配置
const roleBadgeConfig = {
  mapping: [
    { value: 'admin', label: '管理员', variant: 'default' as const },
    { value: 'user', label: '普通用户', variant: 'secondary' as const },
    { value: 'guest', label: '访客', variant: 'outline' as const },
  ],
}

// 状态映射配置
const statusBadgeConfig = {
  mapping: [
    { value: 'active', label: '激活', variant: 'default' as const },
    { value: 'inactive', label: '未激活', variant: 'secondary' as const },
  ],
}

// 表格列配置
const columns: ColumnConfig[] = [
  {
    id: 'name',
    header: '姓名',
    accessor: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: '邮箱',
    accessor: 'email',
  },
  {
    id: 'phone',
    header: '手机号',
    accessor: 'phone',
  },
  {
    id: 'role',
    header: '角色',
    accessor: 'role',
    cellRenderer: {
      type: 'badge',
      badgeConfig: roleBadgeConfig,
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
    id: 'createdAt',
    header: '创建时间',
    accessor: 'createdAt',
    sortable: true,
  },
]

// 表单字段配置
const formFieldsConfig: JsonFormConfig['fields'] = [
  {
    name: 'name',
    type: 'text',
    label: '姓名',
    placeholder: '请输入姓名',
    required: true,
    grid: { span: 12 },
  },
  {
    name: 'email',
    type: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    required: true,
    grid: { span: 12 },
  },
  {
    name: 'phone',
    type: 'text',
    label: '手机号',
    placeholder: '请输入手机号',
    grid: { span: 12 },
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
    type: 'select',
    label: '状态',
    options: [
      { label: '激活', value: 'active' },
      { label: '未激活', value: 'inactive' },
    ],
    grid: { span: 6 },
  },
]

// 操作按钮配置
const actionsButtonsConfig: ActionsConfig['buttons'] = [
  {
    id: 'edit',
    label: '编辑',
    icon: 'Pencil',
    variant: 'ghost',
  },
]

// 页面完整配置（用于后端返回）
const pageConfig = {
  id: 'table-form-demo',
  title: '表格表单联动场景',
  description: '点击表格操作栏的编辑按钮，弹窗显示对应的表单进行数据编辑',
  table: {
    columns,
    actions: {
      id: 'actions',
      header: '操作',
      fixed: 'right',
      buttons: actionsButtonsConfig,
    },
    pagination: {
      show: true,
      defaultPageSize: 10,
      showTotal: true,
    },
    toolbar: {
      search: { show: true, placeholder: '搜索用户...' },
      columnSettings: { show: true },
    },
  },
  form: {
    fields: formFieldsConfig,
    submit: { text: '保存' },
  },
  modal: {
    title: '编辑用户',
    width: 500,
    confirmText: '保存',
    cancelText: '取消',
  },
}

/**
 * 表格表单联动场景展示页面
 * 演示表格操作栏编辑按钮点击后弹窗显示表单的场景
 */
export function TableFormDemoPage() {
  const [usersData, setUsersData] = useState<UserInfo[]>(initialUsersData)

  // 根据表格列生成表单字段配置
  const getFormConfig = (rowData: RowData): JsonFormConfig => ({
    fields: formFieldsConfig,
    submit: {
      text: '保存',
    },
  })

  // 处理编辑操作
  const handleEdit = (row: RowData) => {
    const formConfig = getFormConfig(row)
    let currentFormData: Record<string, unknown> = { ...row }

    modal.confirm({
      title: '编辑用户',
      width: 500,
      confirmText: '保存',
      cancelText: '取消',
      content: (
        <div className="py-4">
          <JsonForm
            config={{ ...formConfig, submit: false }}
            defaultValues={row}
            onValuesChange={(values) => {
              currentFormData = { ...row, ...values }
            }}
          />
        </div>
      ),
      onConfirm: async () => {
        // 更新数据
        setUsersData((prev) =>
          prev.map((item) =>
            item.id === row.id ? ({ ...item, ...currentFormData } as UserInfo) : item
          )
        )
        console.log('保存数据:', currentFormData)
      },
    })
  }

  // 操作列配置
  const actions: ActionsConfig = {
    id: 'actions',
    header: '操作',
    fixed: 'right',
    buttons: [
      {
        id: 'edit',
        label: '编辑',
        icon: <Pencil className="h-4 w-4" />,
        variant: 'ghost',
        onClick: (row) => {
          handleEdit(row)
        },
      },
    ],
  }

  return (
    <div className="container mx-auto py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">表格表单联动场景</h1>
        <p className="mt-2 text-muted-foreground">
          点击表格操作栏的编辑按钮，弹窗显示对应的表单进行数据编辑
        </p>
      </div>

      {/* 场景说明 */}
      <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
        <h2 className="mb-2 font-semibold">场景说明</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>表格展示用户列表数据</li>
          <li>操作栏包含编辑按钮</li>
          <li>点击编辑按钮后弹窗显示表单，表单字段与表格列对应</li>
          <li>表单自动填充当前行的数据</li>
          <li>保存后更新表格数据</li>
        </ul>
      </div>

      {/* 表格区域 */}
      <div className="mb-12 rounded-lg border border-border bg-card">
        <DataTable
          data={usersData}
          columns={columns}
          actions={actions}
          pagination={{
            show: true,
            defaultPageSize: 10,
            showTotal: true,
          }}
          toolbar={{
            search: { show: true, placeholder: '搜索用户...' },
            columnSettings: { show: true },
          }}
        />
      </div>

      {/* 配置 JSON 展示区域 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">页面配置 JSON</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          以下配置可由后端接口返回，前端根据配置动态渲染页面组件。这是实现低代码/配置驱动页面的基础。
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 表格配置 */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">表格配置 (Table Config)</h3>
              <p className="text-xs text-muted-foreground">定义表格列、操作按钮、分页等</p>
            </div>
            <div className="max-h-[400px] overflow-auto p-4">
              <pre className="text-xs">{JSON.stringify(pageConfig.table, null, 2)}</pre>
            </div>
          </div>

          {/* 表单配置 */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-medium">表单配置 (Form Config)</h3>
              <p className="text-xs text-muted-foreground">定义弹窗表单字段、布局、验证等</p>
            </div>
            <div className="max-h-[400px] overflow-auto p-4">
              <pre className="text-xs">{JSON.stringify(pageConfig.form, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* 完整配置 */}
        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-medium">完整页面配置 (Page Config)</h3>
            <p className="text-xs text-muted-foreground">
              后端接口可返回的完整配置结构，包含页面元数据、表格、表单、弹窗等所有配置
            </p>
          </div>
          <div className="max-h-[500px] overflow-auto p-4">
            <pre className="text-xs">{JSON.stringify(pageConfig, null, 2)}</pre>
          </div>
        </div>

        {/* 配置说明 */}
        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="mb-3 font-medium">配置字段说明</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-foreground">表格列配置 (columns)</h4>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>
                  <code className="text-primary">id</code> - 列唯一标识
                </li>
                <li>
                  <code className="text-primary">header</code> - 表头文字
                </li>
                <li>
                  <code className="text-primary">accessor</code> - 数据字段名
                </li>
                <li>
                  <code className="text-primary">sortable</code> - 是否可排序
                </li>
                <li>
                  <code className="text-primary">cellRenderer</code> - 单元格渲染配置
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">表单字段配置 (fields)</h4>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>
                  <code className="text-primary">name</code> - 字段名
                </li>
                <li>
                  <code className="text-primary">type</code> - 字段类型
                </li>
                <li>
                  <code className="text-primary">label</code> - 标签文字
                </li>
                <li>
                  <code className="text-primary">grid</code> - 栅格布局配置
                </li>
                <li>
                  <code className="text-primary">options</code> - 选项配置
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">操作按钮配置 (buttons)</h4>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>
                  <code className="text-primary">id</code> - 按钮标识
                </li>
                <li>
                  <code className="text-primary">label</code> - 按钮文字
                </li>
                <li>
                  <code className="text-primary">icon</code> - 图标名称
                </li>
                <li>
                  <code className="text-primary">variant</code> - 按钮样式
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

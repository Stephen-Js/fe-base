/**
 * 拖拽布局场景展示页面
 * 展示从右侧侧边栏拖拽组件到画布的功能
 */

'use client'

import { type ActionsConfig, type ColumnConfig, DataTable } from '@repo/ui/custom/data-table'
import {
  Canvas,
  type ComponentRegistry,
  ComponentSidebar,
  type LayoutItem,
  useLayoutHistory,
} from '@repo/ui/custom/drag-layout'
import { JsonForm, type JsonFormConfig } from '@repo/ui/custom/json-form'
import { modal } from '@repo/ui/custom/modal'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Code2,
  Pencil,
  Redo2,
  RotateCcw,
  Undo2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// 示例表格数据
const sampleTableData = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: '活跃' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: '离线' },
  { id: '3', name: '王五', email: 'wangwu@example.com', status: '活跃' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', status: '离线' },
  { id: '5', name: '孙七', email: 'sunqi@example.com', status: '活跃' },
]

const sampleTableColumns: ColumnConfig[] = [
  { id: 'name', header: '姓名', accessor: 'name' },
  { id: 'email', header: '邮箱', accessor: 'email' },
  { id: 'status', header: '状态', accessor: 'status' },
]

// 表格二号数据
const table2Data = [
  { id: '1', productName: '笔记本电脑', price: '¥5999', stock: 156 },
  { id: '2', productName: '无线鼠标', price: '¥129', stock: 423 },
  { id: '3', productName: '机械键盘', price: '¥399', stock: 87 },
  { id: '4', productName: '显示器', price: '¥1899', stock: 65 },
  { id: '5', productName: '耳机', price: '¥299', stock: 234 },
]

const table2Columns: ColumnConfig[] = [
  { id: 'productName', header: '产品名称', accessor: 'productName' },
  { id: 'price', header: '价格', accessor: 'price' },
  { id: 'stock', header: '库存', accessor: 'stock', align: 'center' },
]

// 表格二号表单配置
const table2FormFields: JsonFormConfig['fields'] = [
  {
    name: 'productName',
    type: 'text',
    label: '产品名称',
    placeholder: '请输入产品名称',
    required: true,
    grid: { span: 12 },
  },
  {
    name: 'price',
    type: 'text',
    label: '价格',
    placeholder: '请输入价格',
    grid: { span: 6 },
  },
  {
    name: 'stock',
    type: 'number',
    label: '库存',
    placeholder: '请输入库存数量',
    grid: { span: 6 },
  },
]

// 组件注册表配置
const componentRegistry: ComponentRegistry = {
  table: {
    type: 'table',
    name: '数据表格',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    render: ({ width, height }) => {
      // 根据 height 计算显示的行数
      const visibleRows = Math.max(3, Math.floor(height / 50))
      return (
        <div style={{ width, height: '100%' }} className="overflow-auto">
          <DataTable
            data={sampleTableData.slice(0, visibleRows)}
            columns={sampleTableColumns}
            pagination={{ show: false }}
          />
        </div>
      )
    },
  },
  table2: {
    type: 'table2',
    name: '表格二号',
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 5, h: 4 },
    render: ({ width, height }) => {
      const visibleRows = Math.max(3, Math.floor(height / 50))

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
              let currentFormData: Record<string, unknown> = { ...row }

              modal.confirm({
                title: '编辑产品',
                width: 450,
                confirmText: '保存',
                cancelText: '取消',
                content: (
                  <div className="py-4">
                    <JsonForm
                      config={{ fields: table2FormFields, submit: false }}
                      defaultValues={row}
                      onValuesChange={(values) => {
                        currentFormData = { ...row, ...values }
                      }}
                    />
                  </div>
                ),
                onConfirm: async () => {
                  console.log('保存数据:', currentFormData)
                },
              })
            },
          },
        ],
      }

      return (
        <div style={{ width, height: '100%' }} className="overflow-auto">
          <DataTable
            data={table2Data.slice(0, visibleRows)}
            columns={table2Columns}
            actions={actions}
            pagination={{ show: false }}
          />
        </div>
      )
    },
  },
}

// localStorage key
const STORAGE_KEY = 'drag-layout-v1'

// 将组件注册表转换为可序列化的配置（移除 render 函数）
function getSerializableRegistry(registry: ComponentRegistry) {
  const result: Record<string, Record<string, unknown>> = {}
  for (const [key, value] of Object.entries(registry)) {
    result[key] = {
      type: value.type,
      name: value.name,
      defaultSize: value.defaultSize,
      minSize: value.minSize,
    }
  }
  return result
}

/**
 * 拖拽布局场景展示页面
 */
export function DragLayoutPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [configPanelCollapsed, setConfigPanelCollapsed] = useState(false)

  const { layout, setLayout, undo, redo, canUndo, canRedo } = useLayoutHistory([])

  // 客户端水合后从 localStorage 加载布局
  useEffect(() => {
    setIsHydrated(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setLayout(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [setLayout])

  // 持久化布局到 localStorage
  useEffect(() => {
    if (!isHydrated) return
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    }, 500)
    return () => clearTimeout(timer)
  }, [layout, isHydrated])

  // 删除卡片
  const handleDeleteCard = useCallback(
    (id: string) => {
      setLayout(layout.filter((item) => item.i !== id))
    },
    [layout, setLayout]
  )

  // 重置布局
  const handleReset = useCallback(() => {
    setLayout([])
    localStorage.removeItem(STORAGE_KEY)
  }, [setLayout])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* 头部工具栏 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>返回</span>
          </a>
          <h1 className="text-xl font-bold">拖拽布局场景</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 撤销/重做按钮 */}
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="重置布局"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 主内容区域 - 画布 + 右侧组件库 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 画布区域 */}
        <main className="flex-1 overflow-auto p-6">
          <Canvas
            layout={layout}
            onLayoutChange={setLayout}
            componentRegistry={componentRegistry}
            onDeleteCard={handleDeleteCard}
          />
        </main>

        {/* 右侧组件库侧边栏 */}
        <ComponentSidebar
          componentRegistry={componentRegistry}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* 配置 JSON 展示区域 */}
      <div className="shrink-0 h-[450px] border-t border-border bg-background flex flex-col">
        {/* 折叠面板头部 */}
        <button
          type="button"
          onClick={() => setConfigPanelCollapsed(!configPanelCollapsed)}
          className="flex shrink-0 items-center justify-between px-6 py-2 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="font-medium">配置 JSON</span>
            <span className="text-xs text-muted-foreground">展示当前画布布局和组件注册表配置</span>
          </div>
          {configPanelCollapsed ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* 展开时显示的配置内容 */}
        {!configPanelCollapsed && (
          <div className="flex-1 overflow-auto p-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 画布布局配置 */}
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="font-medium">画布布局 (Layout)</h3>
                  <p className="text-xs text-muted-foreground">
                    当前画布上拖拽组件的位置和尺寸信息
                  </p>
                </div>
                <div className="overflow-auto p-4" style={{ maxHeight: 'calc(450px - 100px)' }}>
                  <pre className="text-xs">{JSON.stringify(layout, null, 2)}</pre>
                </div>
              </div>

              {/* 组件注册表配置 */}
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="font-medium">组件注册表 (Component Registry)</h3>
                  <p className="text-xs text-muted-foreground">可拖拽到画布的组件配置信息</p>
                </div>
                <div className="overflow-auto p-4" style={{ maxHeight: 'calc(450px - 100px)' }}>
                  <pre className="text-xs">
                    {JSON.stringify(getSerializableRegistry(componentRegistry), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* 完整配置 */}
            <div className="mt-6 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-medium">完整页面配置 (Page Config)</h3>
                <p className="text-xs text-muted-foreground">
                  完整的拖拽布局页面配置，可用于持久化存储或后端返回
                </p>
              </div>
              <div className="overflow-auto p-4" style={{ maxHeight: 'calc(450px - 100px)' }}>
                <pre className="text-xs">
                  {JSON.stringify(
                    {
                      layout,
                      componentRegistry: getSerializableRegistry(componentRegistry),
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

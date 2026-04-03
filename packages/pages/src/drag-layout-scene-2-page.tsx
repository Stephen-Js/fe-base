'use client'

import { apiGet, apiPost } from '@repo/api'
import type {
  CanvasComponentInstance,
  CanvasLayoutItem,
  ComponentDataSchema,
  ComponentDataSource,
  ComponentDetailData,
  ComponentPaletteItem,
  ComponentPaletteListData,
} from '@repo/types'
import {
  type ActionsConfig,
  type ColumnConfig,
  DataTable,
  type RowData,
} from '@repo/ui/custom/data-table'
import { JsonForm, type JsonFormConfig } from '@repo/ui/custom/json-form'
import { modal } from '@repo/ui/custom/modal'
import { ThreePaneLayout } from '@repo/ui/custom/three-pane-layout'
import { Button } from '@repo/ui/shadcn/button'
import { useQuery } from '@tanstack/react-query'
import { Columns3, GripVertical, LayoutGrid, PanelLeft, PanelRight } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import ReactGridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'

interface SectionTitleProps {
  title: string
  subtitle: string
}

interface InstancePaginationState {
  page: number
  pageSize: number
  total: number
}

function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function getValueByPath(source: unknown, path?: string): unknown {
  if (!path) {
    return source
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment]
    }

    return undefined
  }, source)
}

function getDefaultPageSize(instance?: CanvasComponentInstance): number {
  const props = instance?.renderSchema?.props ?? {}

  if (instance?.renderSchema?.kind === 'table') {
    const pagination = props.pagination as { defaultPageSize?: number } | undefined
    return Number(pagination?.defaultPageSize) || 10
  }

  if (instance?.renderSchema?.kind === 'composite') {
    const table = props.table as { pagination?: { defaultPageSize?: number } } | undefined
    return Number(table?.pagination?.defaultPageSize) || 10
  }

  return 10
}

export function DragLayoutScene2Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['component-palette'],
    queryFn: () => apiGet<ComponentPaletteListData>('/component-palette'),
  })

  const [layoutItems, setLayoutItems] = useState<CanvasLayoutItem[]>([])
  const [instances, setInstances] = useState<Record<string, CanvasComponentInstance>>({})
  const [runtimeData, setRuntimeData] = useState<Record<string, unknown[]>>({})
  const [runtimeLoading, setRuntimeLoading] = useState<Record<string, boolean>>({})
  const [runtimePagination, setRuntimePagination] = useState<
    Record<string, InstancePaginationState>
  >({})
  const isDroppingRef = useRef(false)
  const { width, containerRef, mounted } = useContainerWidth()

  const paletteItems: ComponentPaletteItem[] = data?.data.list ?? []
  const instanceCount = useMemo(() => Object.keys(instances).length, [instances])

  const getCompositeTableConfig = useCallback((instance: CanvasComponentInstance) => {
    const props = instance.renderSchema?.props ?? {}
    return (props.table ?? {}) as Record<string, unknown>
  }, [])

  const getCompositeModalFormConfig = useCallback((instance: CanvasComponentInstance) => {
    const props = instance.renderSchema?.props ?? {}
    return (props.modalForm ?? {}) as Record<string, unknown>
  }, [])

  const getCompositeModalConfig = useCallback((instance: CanvasComponentInstance) => {
    const props = instance.renderSchema?.props ?? {}
    return (props.modal ?? {}) as Record<string, unknown>
  }, [])

  const loadRuntimeData = useCallback(
    async (
      instanceId: string,
      dataSchema?: ComponentDataSchema,
      fallbackSource?: ComponentDataSource,
      paginationOverride?: Partial<InstancePaginationState>
    ) => {
      const instance = instances[instanceId]
      const resolvedDataSchema = dataSchema ?? instance?.dataSchema
      const source = fallbackSource ?? resolvedDataSchema?.source

      if (!source || resolvedDataSchema?.mode !== 'remote') {
        return
      }

      setRuntimeLoading((prev) => ({ ...prev, [instanceId]: true }))

      try {
        const normalizedUrl = source.url.replace(/^\/api/, '')
        const paginationConfig = source.pagination
        const currentPagination = runtimePagination[instanceId]
        const page = paginationOverride?.page ?? currentPagination?.page ?? 1
        const pageSize =
          paginationOverride?.pageSize ??
          currentPagination?.pageSize ??
          getDefaultPageSize(instance)
        const requestQuery = { ...(source.query ?? {}) }

        if (paginationConfig?.enabled) {
          requestQuery[paginationConfig.pageParam ?? 'page'] = page
          requestQuery[paginationConfig.pageSizeParam ?? 'pageSize'] = pageSize
        }

        const response =
          source.method === 'GET'
            ? await apiGet<Record<string, unknown>>(normalizedUrl, {
                params: requestQuery,
              })
            : await apiPost<Record<string, unknown>>(normalizedUrl, source.body)

        const listPath = paginationConfig?.listPath ?? source.dataPath ?? 'data.list'
        const totalPath = paginationConfig?.totalPath ?? 'data.total'
        const listValue = getValueByPath(response, listPath)
        const totalValue = getValueByPath(response, totalPath)
        const list = Array.isArray(listValue) ? listValue : []
        const total =
          paginationConfig?.enabled && typeof totalValue === 'number' ? totalValue : list.length

        setRuntimeData((prev) => ({
          ...prev,
          [instanceId]: list,
        }))

        setRuntimePagination((prev) => ({
          ...prev,
          [instanceId]: {
            page,
            pageSize,
            total,
          },
        }))
      } finally {
        setRuntimeLoading((prev) => ({ ...prev, [instanceId]: false }))
      }
    },
    [instances, runtimePagination]
  )

  const loadComponentDetail = useCallback(
    async (componentId: string, instanceId: string) => {
      try {
        const response = await apiGet<ComponentDetailData>(
          `/component-palette/${componentId}/detail`
        )

        setInstances((prev) => {
          const current = prev[instanceId]
          if (!current) {
            return prev
          }

          return {
            ...prev,
            [instanceId]: {
              ...current,
              status: 'ready',
              renderSchema: response.data.renderSchema,
              dataSchema: response.data.dataSchema,
              actionSchema: response.data.actionSchema,
              errorMessage: undefined,
            },
          }
        })

        if (response.data.dataSchema.mode === 'remote') {
          const detailInstance: CanvasComponentInstance = {
            id: instanceId,
            componentId: response.data.component.id,
            componentType: response.data.component.type,
            name: response.data.component.name,
            configVersion: response.data.component.configVersion,
            status: 'ready',
            renderSchema: response.data.renderSchema,
            dataSchema: response.data.dataSchema,
            actionSchema: response.data.actionSchema,
          }
          const initialPageSize = getDefaultPageSize(detailInstance)

          setRuntimePagination((prev) => ({
            ...prev,
            [instanceId]: {
              page: 1,
              pageSize: initialPageSize,
              total: 0,
            },
          }))

          void loadRuntimeData(
            instanceId,
            response.data.dataSchema,
            response.data.dataSchema.source,
            { page: 1, pageSize: initialPageSize }
          )
        } else if (response.data.dataSchema.mode === 'static') {
          const list = Array.isArray(response.data.dataSchema.mockData)
            ? response.data.dataSchema.mockData
            : []

          setRuntimeData((prev) => ({
            ...prev,
            [instanceId]: list,
          }))

          setRuntimePagination((prev) => ({
            ...prev,
            [instanceId]: {
              page: 1,
              pageSize: list.length || getDefaultPageSize(),
              total: list.length,
            },
          }))
        }
      } catch {
        setInstances((prev) => {
          const current = prev[instanceId]
          if (!current) {
            return prev
          }

          return {
            ...prev,
            [instanceId]: {
              ...current,
              status: 'error',
              errorMessage: '组件详情加载失败，请重试',
            },
          }
        })
      }
    },
    [loadRuntimeData]
  )

  const handlePaletteDragStart = useCallback(
    (event: React.DragEvent, item: ComponentPaletteItem) => {
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          componentId: item.id,
          componentType: item.type,
          name: item.name,
          configVersion: item.configVersion,
          defaultSize: item.defaultSize,
          minSize: item.minSize,
        })
      )
    },
    []
  )

  const handleDrop = useCallback(
    (_currentLayout: Layout, item: Layout[number] | undefined, event: Event) => {
      const dragEvent = event as DragEvent
      const rawPayload = dragEvent.dataTransfer?.getData('application/json')

      if (!rawPayload || !item) {
        return
      }

      const payload = JSON.parse(rawPayload) as {
        componentId: string
        componentType: string
        name: string
        configVersion: string
        defaultSize: { w: number; h: number }
        minSize?: { w: number; h: number }
      }

      const instanceId = `instance-${Date.now()}`

      isDroppingRef.current = true

      setTimeout(() => {
        isDroppingRef.current = false
      }, 100)

      setLayoutItems((prev) => [
        ...prev,
        {
          i: instanceId,
          x: item.x,
          y: item.y,
          w: item.w ?? payload.defaultSize.w,
          h: item.h ?? payload.defaultSize.h,
          componentId: payload.componentId,
          componentType: payload.componentType,
          minW: payload.minSize?.w,
          minH: payload.minSize?.h,
        },
      ])

      setInstances((prev) => ({
        ...prev,
        [instanceId]: {
          id: instanceId,
          componentId: payload.componentId,
          componentType: payload.componentType,
          name: payload.name,
          configVersion: payload.configVersion,
          status: 'loading',
        },
      }))

      void loadComponentDetail(payload.componentId, instanceId)
    },
    [loadComponentDetail]
  )

  const handleLayoutChange = useCallback((nextLayout: Layout) => {
    if (isDroppingRef.current) {
      return
    }

    setLayoutItems((prev) => {
      const cleanLayout = nextLayout.filter((entry) => !entry.i.startsWith('__dropping'))

      return cleanLayout.map((entry: Layout[number]) => {
        const current = prev.find((item) => item.i === entry.i)

        if (!current) {
          return {
            i: entry.i,
            x: entry.x,
            y: entry.y,
            w: entry.w,
            h: entry.h,
            componentId: '',
            componentType: '',
          }
        }

        return {
          ...current,
          x: entry.x,
          y: entry.y,
          w: entry.w,
          h: entry.h,
        }
      })
    })
  }, [])

  const handleDeleteInstance = useCallback((instanceId: string) => {
    setLayoutItems((prev) => prev.filter((item) => item.i !== instanceId))
    setInstances((prev) => {
      const next = { ...prev }
      delete next[instanceId]
      return next
    })
    setRuntimeData((prev) => {
      const next = { ...prev }
      delete next[instanceId]
      return next
    })
    setRuntimeLoading((prev) => {
      const next = { ...prev }
      delete next[instanceId]
      return next
    })
    setRuntimePagination((prev) => {
      const next = { ...prev }
      delete next[instanceId]
      return next
    })
  }, [])

  const handleRetryInstance = useCallback(
    (instanceId: string) => {
      const instance = instances[instanceId]
      if (!instance) {
        return
      }

      setInstances((prev) => {
        const current = prev[instanceId]
        if (!current) {
          return prev
        }

        return {
          ...prev,
          [instanceId]: {
            ...current,
            status: 'loading',
            errorMessage: undefined,
          },
        }
      })

      void loadComponentDetail(instance.componentId, instanceId)
    },
    [instances, loadComponentDetail]
  )

  const handlePaginationChange = useCallback(
    async (instanceId: string, page: number, pageSize: number) => {
      await loadRuntimeData(instanceId, undefined, undefined, { page, pageSize })
    },
    [loadRuntimeData]
  )

  const openCompositeEdit = useCallback(
    async (instanceId: string, row: RowData) => {
      const instance = instances[instanceId]
      if (!instance) {
        return
      }

      const modalForm = getCompositeModalFormConfig(instance)
      const modalConfig = getCompositeModalConfig(instance)
      const submitAction = instance.actionSchema?.actions.find((action) => action.id === 'submit')

      let currentFormData: Record<string, unknown> = { ...row }

      await modal.confirm({
        title: (modalConfig.title as string | undefined) ?? '编辑',
        width: ((modalConfig.width as number | undefined) ?? 500) as number,
        confirmText: (modalConfig.confirmText as string | undefined) ?? '保存',
        cancelText: (modalConfig.cancelText as string | undefined) ?? '取消',
        content: (
          <div className="py-4">
            <JsonForm
              config={{
                fields: (modalForm.fields ?? []) as JsonFormConfig['fields'],
                submit: false,
              }}
              defaultValues={row}
              onValuesChange={(values) => {
                currentFormData = { ...row, ...values }
              }}
            />
          </div>
        ),
        onConfirm: async () => {
          if (submitAction?.api) {
            await apiPost(submitAction.api.url.replace(/^\/api/, ''), currentFormData)
          }

          await loadRuntimeData(instanceId)
        },
      })
    },
    [getCompositeModalConfig, getCompositeModalFormConfig, instances, loadRuntimeData]
  )

  return (
    <div className="h-screen w-full bg-muted/30 p-4">
      <ThreePaneLayout className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <ThreePaneLayout.LeftSidebar className="bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <SectionTitle title="组件菜单" subtitle="左侧菜单栏" />
            <ThreePaneLayout.LeftToggle />
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Columns3 className="h-4 w-4" />
                基础组件
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                    加载组件列表中...
                  </div>
                </div>
              ) : null}

              {isError ? (
                <div className="space-y-3 rounded-xl border border-border bg-background p-3">
                  <p className="text-sm text-destructive">组件列表加载失败，请重试</p>
                  <Button variant="outline" size="sm" onClick={() => void refetch()}>
                    重试
                  </Button>
                </div>
              ) : null}

              {!isLoading && !isError ? (
                <div className="space-y-2">
                  {paletteItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      draggable
                      onDragStart={(event) => handlePaletteDragStart(event, item)}
                      className="w-full rounded-lg border border-dashed border-border bg-background p-3 text-left transition-colors hover:border-primary"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.description}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            默认尺寸 {item.defaultSize.w} x {item.defaultSize.h}
                          </div>
                        </div>
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </ThreePaneLayout.LeftSidebar>

        <ThreePaneLayout.Main className="bg-background">
          <div className="flex h-full flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <SectionTitle title="拖拽布局场景 2" subtitle="中间整个区域作为画布区域" />
              <Button variant="outline" size="sm">
                画布实例 {instanceCount}
              </Button>
            </div>

            <div className="flex flex-1 p-6">
              <div
                ref={containerRef}
                className="relative h-full w-full rounded-2xl border border-dashed border-border bg-muted/40"
              >
                {layoutItems.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                      <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                      <div className="space-y-1">
                        <div className="text-base font-medium text-foreground">拖拽组件到画布</div>
                        <div className="text-sm text-muted-foreground">
                          拖入后会先创建占位实例，再异步加载组件详情。
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {mounted ? (
                  <ReactGridLayout
                    layout={layoutItems}
                    width={width}
                    gridConfig={{ cols: 12, rowHeight: 50 }}
                    dropConfig={{
                      enabled: true,
                      defaultItem: { w: 6, h: 5 },
                    }}
                    dragConfig={{
                      enabled: true,
                      handle: '.drag-handle',
                    }}
                    autoSize={false}
                    style={{ minHeight: '100%' }}
                    onDrop={handleDrop}
                    onDropDragOver={() => ({ w: 6, h: 5 })}
                    onLayoutChange={handleLayoutChange}
                  >
                    {layoutItems.map((item) => {
                      const instance = instances[item.i]
                      const instancePagination = runtimePagination[item.i]

                      if (!instance) {
                        return null
                      }

                      const columns = Array.isArray(instance.renderSchema?.props.columns)
                        ? instance.renderSchema?.props.columns.length
                        : Array.isArray(
                              (
                                instance.renderSchema?.props.table as
                                  | Record<string, unknown>
                                  | undefined
                              )?.columns
                            )
                          ? (
                              (instance.renderSchema?.props.table as Record<string, unknown>)
                                .columns as unknown[]
                            ).length
                          : 0

                      return (
                        <div key={item.i}>
                          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                            <div className="drag-handle flex cursor-grab items-center justify-between border-b border-border bg-muted/30 px-3 py-2 active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {instance.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstance(instance.id)}
                              >
                                删除
                              </Button>
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                              {instance.status === 'loading' ? (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                  <div>加载组件配置中...</div>
                                  <div>正在获取组件详情与渲染协议</div>
                                </div>
                              ) : null}

                              {instance.status === 'error' ? (
                                <div className="space-y-3">
                                  <p className="text-sm text-destructive">
                                    {instance.errorMessage}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryInstance(instance.id)}
                                  >
                                    重试
                                  </Button>
                                </div>
                              ) : null}

                              {instance.status === 'ready' ? (
                                <>
                                  {instance.renderSchema?.kind === 'table' ? (
                                    <DataTable
                                      data={(runtimeData[instance.id] ?? []) as RowData[]}
                                      columns={
                                        ((instance.renderSchema?.props.columns ??
                                          []) as ColumnConfig[]) ?? []
                                      }
                                      actions={
                                        instance.renderSchema?.props.actions as
                                          | ActionsConfig
                                          | undefined
                                      }
                                      loading={runtimeLoading[instance.id]}
                                      pagination={{
                                        show: true,
                                        mode: instance.dataSchema?.source?.pagination?.enabled
                                          ? 'server'
                                          : 'client',
                                        current: instancePagination?.page ?? 1,
                                        pageSize:
                                          instancePagination?.pageSize ??
                                          getDefaultPageSize(instance),
                                        total:
                                          instancePagination?.total ??
                                          runtimeData[instance.id]?.length ??
                                          0,
                                        pageSizeOptions: [10, 20, 50],
                                        showTotal: true,
                                        showJumper: true,
                                        onChange: (page, pageSize) => {
                                          void handlePaginationChange(instance.id, page, pageSize)
                                        },
                                        onPageSizeChange: (pageSize) => {
                                          void handlePaginationChange(instance.id, 1, pageSize)
                                        },
                                      }}
                                    />
                                  ) : null}

                                  {instance.renderSchema?.kind === 'form' ? (
                                    <JsonForm
                                      config={{
                                        fields: (instance.renderSchema?.props.fields ??
                                          []) as JsonFormConfig['fields'],
                                        submit: false,
                                      }}
                                    />
                                  ) : null}

                                  {instance.renderSchema?.kind === 'composite' ? (
                                    <DataTable
                                      data={(runtimeData[instance.id] ?? []) as RowData[]}
                                      columns={
                                        ((getCompositeTableConfig(instance).columns ??
                                          []) as ColumnConfig[]) ?? []
                                      }
                                      actions={(() => {
                                        const rawActions = getCompositeTableConfig(instance)
                                          .actions as ActionsConfig | undefined

                                        if (!rawActions) {
                                          return undefined
                                        }

                                        return {
                                          ...rawActions,
                                          buttons: rawActions.buttons.map((button) => ({
                                            ...button,
                                            onClick: (row, _rowIndex) => {
                                              if (button.id === 'edit') {
                                                void openCompositeEdit(instance.id, row)
                                              }
                                            },
                                          })),
                                        } satisfies ActionsConfig
                                      })()}
                                      loading={runtimeLoading[instance.id]}
                                      pagination={{
                                        show: ((
                                          getCompositeTableConfig(instance).pagination as
                                            | { show?: boolean }
                                            | undefined
                                        )?.show ?? true) as boolean,
                                        mode: instance.dataSchema?.source?.pagination?.enabled
                                          ? 'server'
                                          : 'client',
                                        current: instancePagination?.page ?? 1,
                                        pageSize:
                                          instancePagination?.pageSize ??
                                          getDefaultPageSize(instance),
                                        total:
                                          instancePagination?.total ??
                                          runtimeData[instance.id]?.length ??
                                          0,
                                        pageSizeOptions: ((
                                          getCompositeTableConfig(instance).pagination as
                                            | { pageSizeOptions?: number[] }
                                            | undefined
                                        )?.pageSizeOptions ?? [10, 20, 50]) as number[],
                                        defaultPageSize: ((
                                          getCompositeTableConfig(instance).pagination as
                                            | { defaultPageSize?: number }
                                            | undefined
                                        )?.defaultPageSize ??
                                          getDefaultPageSize(instance)) as number,
                                        showTotal: ((
                                          getCompositeTableConfig(instance).pagination as
                                            | { showTotal?: boolean }
                                            | undefined
                                        )?.showTotal ?? true) as boolean,
                                        showJumper: ((
                                          getCompositeTableConfig(instance).pagination as
                                            | { showJumper?: boolean }
                                            | undefined
                                        )?.showJumper ?? true) as boolean,
                                        onChange: (page, pageSize) => {
                                          void handlePaginationChange(instance.id, page, pageSize)
                                        },
                                        onPageSizeChange: (pageSize) => {
                                          void handlePaginationChange(instance.id, 1, pageSize)
                                        },
                                      }}
                                    />
                                  ) : null}

                                  {!['table', 'form', 'composite'].includes(
                                    instance.renderSchema?.kind ?? ''
                                  ) ? (
                                    <div className="space-y-2 text-sm">
                                      <div className="font-medium text-foreground">
                                        渲染协议：{instance.renderSchema?.kind}
                                      </div>
                                      <div className="text-muted-foreground">
                                        当前阶段暂不支持该协议渲染。
                                      </div>
                                      <div className="text-muted-foreground">
                                        配置版本：{instance.configVersion}
                                      </div>
                                      <div className="text-muted-foreground">列数量：{columns}</div>
                                    </div>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </ReactGridLayout>
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
            </div>
          </div>
        </ThreePaneLayout.Main>

        <ThreePaneLayout.RightSidebar className="bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <SectionTitle title="属性面板" subtitle="右侧固定侧边栏" />
            <ThreePaneLayout.RightToggle />
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <PanelLeft className="h-4 w-4" />
                画布信息
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>左栏折叠后缩成窄条，并保留切换按钮。</p>
                <p>右栏折叠后完全隐藏，并在主区域右侧显示贴边展开按钮。</p>
                <p>拖入组件后会创建实例并异步加载详情接口。</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <PanelRight className="h-4 w-4" />
                当前阶段
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>已支持拖入创建实例。</p>
                <p>已支持 loading / ready / error 状态切换。</p>
                <p>下一步可将 ready 态接到真实 JSON 驱动渲染器。</p>
              </div>
            </div>
          </div>
        </ThreePaneLayout.RightSidebar>
      </ThreePaneLayout>
    </div>
  )
}

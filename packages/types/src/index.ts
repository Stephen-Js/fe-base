/** API 通用响应结构 */
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 布局尺寸结构 */
export interface LayoutSize {
  w: number
  h: number
}

/** 左侧组件列表项 */
export interface ComponentPaletteItem {
  id: string
  type: string
  name: string
  description: string
  category: string
  tags: string[]
  icon: string
  thumbnail?: string
  defaultSize: LayoutSize
  minSize: LayoutSize
  configVersion: string
  hasDetail: boolean
}

/** 左侧组件列表响应数据 */
export interface ComponentPaletteListData {
  list: ComponentPaletteItem[]
}

/** 画布局项 */
export interface CanvasLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  componentId: string
  componentType: string
  minW?: number
  minH?: number
}

/** 画布实例状态 */
export type CanvasInstanceStatus = 'loading' | 'ready' | 'error'

/** 组件详情元信息 */
export interface ComponentDetailMeta {
  id: string
  type: string
  name: string
  category: string
  configVersion: string
  renderer: string
}

/** 组件渲染协议 */
export interface ComponentRenderSchema {
  kind: 'table' | 'form' | 'composite'
  props: Record<string, unknown>
  slots?: Record<string, unknown>
  events?: Record<string, unknown>
}

/** 远程数据源分页协议 */
export interface ComponentDataSourcePagination {
  enabled: boolean
  pageParam?: string
  pageSizeParam?: string
  listPath?: string
  totalPath?: string
}

/** 单个主数据源 */
export interface ComponentDataSource {
  url: string
  method: 'GET' | 'POST'
  query?: Record<string, unknown>
  body?: Record<string, unknown>
  headers?: Record<string, string>
  dataPath?: string
  pagination?: ComponentDataSourcePagination
}

/** 组件数据协议 */
export interface ComponentDataSchema {
  mode: 'static' | 'remote'
  source?: ComponentDataSource
  mockData?: unknown
}

/** 组件动作定义 */
export interface ComponentActionDefinition {
  id: string
  type: string
  label?: string
  target?: string
  payload?: Record<string, unknown>
  api?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  }
}

/** 组件动作协议 */
export interface ComponentActionSchema {
  actions: ComponentActionDefinition[]
}

/** 组件详情数据 */
export interface ComponentDetailData {
  component: ComponentDetailMeta
  renderSchema: ComponentRenderSchema
  dataSchema: ComponentDataSchema
  actionSchema?: ComponentActionSchema
}

/** 画布实例 */
export interface CanvasComponentInstance {
  id: string
  componentId: string
  componentType: string
  name: string
  configVersion: string
  status: CanvasInstanceStatus
  renderSchema?: ComponentRenderSchema
  dataSchema?: ComponentDataSchema
  actionSchema?: ComponentActionSchema
  errorMessage?: string
}

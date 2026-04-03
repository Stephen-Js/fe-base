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

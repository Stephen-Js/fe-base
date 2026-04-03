# Drag Layout Scene 2 后端接口对接说明

## 1. 文档目的

本文档面向后端联调，聚焦 scene 2 当前真实需要的接口、字段约束和推荐返回结构。

目标：

- 让后端快速知道当前前端依赖哪些接口
- 让接口字段与前端运行时协议严格对齐
- 减少联调过程中“字段有了但路径不匹配”的问题

## 2. 当前对接链路

当前 scene 2 的真实联调链路只有四段：

1. 获取左侧组件列表
2. 根据组件 id 获取组件详情协议
3. 根据详情协议中的主数据源配置获取业务数据
4. 根据动作协议中的提交接口提交编辑结果

对应接口示意：

```http
GET  /api/component-palette
GET  /api/component-palette/:componentId/detail
GET  /api/users?page=1&pageSize=10
POST /api/users/update
```

## 3. 统一返回结构

建议所有接口统一使用：

```ts
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

说明：

- `code === 0` 代表成功
- `message` 用于错误提示和日志追踪
- `data` 承载业务数据

## 4. 组件列表接口

## 4.1 接口定义

```http
GET /api/component-palette
```

## 4.2 职责

- 供左侧菜单栏展示组件
- 供拖拽时传递轻量元信息

不要在这里返回完整组件 JSON。

## 4.3 返回结构

```ts
interface LayoutSize {
  w: number
  h: number
}

interface ComponentPaletteItem {
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

interface ComponentPaletteListData {
  list: ComponentPaletteItem[]
}
```

## 4.4 字段要求

- `id` 必须唯一且稳定
- `defaultSize` 必填
- `minSize` 建议必填
- `hasDetail` 为 `true` 时，详情接口必须可用

详细字段说明见 [component-palette-api.md](/Users/sunny/work2026/fe-base/docs/api/component-palette-api.md)。

## 5. 组件详情接口

## 5.1 接口定义

```http
GET /api/component-palette/:componentId/detail
```

## 5.2 职责

返回组件实例运行所需的完整协议，包含三层：

- `renderSchema`
- `dataSchema`
- `actionSchema`

## 5.3 返回结构

```ts
interface ComponentDetailMeta {
  id: string
  type: string
  name: string
  category: string
  configVersion: string
  renderer: string
}

interface ComponentRenderSchema {
  kind: 'table' | 'form' | 'composite'
  props: Record<string, unknown>
  slots?: Record<string, unknown>
  events?: Record<string, unknown>
}

interface ComponentDataSourcePagination {
  enabled: boolean
  pageParam?: string
  pageSizeParam?: string
  listPath?: string
  totalPath?: string
}

interface ComponentDataSource {
  url: string
  method: 'GET' | 'POST'
  query?: Record<string, unknown>
  body?: Record<string, unknown>
  headers?: Record<string, string>
  dataPath?: string
  pagination?: ComponentDataSourcePagination
}

interface ComponentDataSchema {
  mode: 'static' | 'remote'
  source?: ComponentDataSource
  mockData?: unknown
}

interface ComponentActionDefinition {
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

interface ComponentActionSchema {
  actions: ComponentActionDefinition[]
}

interface ComponentDetailData {
  component: ComponentDetailMeta
  renderSchema: ComponentRenderSchema
  dataSchema: ComponentDataSchema
  actionSchema?: ComponentActionSchema
}
```

## 5.4 当前前端已支持的渲染协议

- `table`
- `form`
- `composite`

其中 `composite` 当前只支持：

- 表格
- 编辑弹窗表单

## 5.5 当前前端已使用的动作协议

当前最小支持：

- `edit`
- `submit`

其中真正触发接口的是：

- `actionSchema.actions[].api`

详细说明见 [component-detail-api.md](/Users/sunny/work2026/fe-base/docs/api/component-detail-api.md)。

## 6. 主数据源接口

## 6.1 接口角色

该接口由 `dataSchema.source` 决定，不固定只能是 `/api/users`。

对前端来说，它是业务数据接口，不是组件配置接口。

## 6.2 当前分页约定

如果详情协议中：

```json
{
  "pagination": {
    "enabled": true,
    "pageParam": "page",
    "pageSizeParam": "pageSize",
    "listPath": "data.list",
    "totalPath": "data.total"
  }
}
```

则后端必须：

- 支持 `page`
- 支持 `pageSize`
- 返回体里存在 `data.list`
- 返回体里存在 `data.total`

## 6.3 推荐返回结构

```ts
interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

建议返回：

```ts
ApiResponse<PaginatedData<RowItem>>
```

## 6.4 当前前端运行时行为

当前前端会：

- 从 `pagination.pageParam` 读取页码参数名
- 从 `pagination.pageSizeParam` 读取每页条数参数名
- 从 `pagination.listPath` 读取列表路径
- 从 `pagination.totalPath` 读取总数字段路径

所以后端的关键不是“字段大概类似”，而是“路径必须完全一致”。

## 7. 提交接口

## 7.1 接口角色

提交接口由：

```ts
actionSchema.actions[].api
```

决定。

当前场景下，它用于编辑弹窗表单提交。

## 7.2 当前前端行为

用户点击提交后，前端会：

1. 取当前表单值
2. 调用提交接口
3. 成功后重新请求当前页主数据源

因此提交接口本身不需要返回刷新后的列表，只需要明确成功或失败即可。

## 7.3 推荐返回结构

```ts
ApiResponse<{
  success: boolean
}>
```

## 8. 推荐联调顺序

建议按以下顺序逐步切换真实接口：

1. `GET /api/component-palette`
2. `GET /api/component-palette/:componentId/detail`
3. `dataSchema.source` 对应的主数据源接口
4. `actionSchema` 对应的提交接口

这样可以逐段替换 `msw`，联调过程更稳。

## 9. 当前实现边界

当前 scene 2 仍然只要求后端先满足最小链路，不需要一次性提供全部低代码能力。

当前未覆盖：

- 多数据源
- 远程搜索协议
- 远程排序协议
- 新增、删除、批量操作
- 复杂事件编排
- 更多 composite 组合模式

所以后端现在只需要优先保证：

- 组件列表接口稳定
- 组件详情协议稳定
- 单主数据源接口稳定
- 单提交接口稳定

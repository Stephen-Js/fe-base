# Drag Layout Scene 2 功能与对接说明

## 1. 文档目的

本文档用于说明 [drag-layout-scene-2-page.tsx](/Users/sunny/work2026/fe-base/packages/pages/src/drag-layout-scene-2-page.tsx) 当前已经实现的功能、页面运行流程、前后端接口职责边界，以及后端真实接口需要遵守的协议约定。

目标：

- 让前端能快速理解当前场景 2 的实现方式
- 让后端能明确需要提供哪些接口、返回哪些字段
- 让后续 JSON 驱动组件扩展时有统一理解

## 2. 页面功能概览

当前页面是一个“三栏拖拽布局场景”：

- 左侧：组件菜单栏
- 中间：画布区域
- 右侧：固定属性侧边栏

其中已经实现的核心能力如下：

- 左侧组件列表通过接口获取，而不是写死在页面
- 左侧组件可拖拽到中间画布
- 拖入画布后会立即生成一个实例卡片
- 实例卡片支持 `loading / ready / error` 三种状态
- 页面会在实例创建后异步请求组件详情接口
- 组件详情返回后，页面会根据协议渲染真实组件
- 当前已支持的协议类型：
  - `table`
  - `form`
  - `composite`
- 当前 `composite` 第一版只支持一种组合：
  - 表格 + 编辑弹窗表单
- 如果主数据源是远程接口，页面会继续请求主数据源
- 表格主数据源已支持服务端分页
- 点击“编辑”后可弹出表单
- 表单提交后会调用提交接口，并刷新当前页数据

## 3. 当前支持的业务形态

从业务角度看，当前 scene 2 已经能承载一个最小可运行的“JSON 驱动 CRUD 组件”：

- 左侧列表返回一个“带编辑操作的表格”组件元信息
- 拖入画布后，通过详情接口返回完整协议
- 详情协议描述：
  - 表格列
  - 表格操作栏
  - 弹窗表单字段
  - 提交动作接口
  - 表格主数据源接口
- 页面根据协议渲染出真实表格
- 表格数据来自远程主数据源
- 编辑后调用提交接口并刷新表格

也就是说，当前实现不是“只做布局演示”，而是已经具备了组件实例化和最小运行时渲染能力。

## 4. 前端运行流程

## 4.1 页面初始化

页面初始化后，先请求左侧组件菜单接口：

```http
GET /api/component-palette
```

该接口只返回轻量组件元信息，用于：

- 左侧展示
- 拖拽时传递必要元数据

不会返回完整组件 JSON。

## 4.2 用户拖拽到画布

用户从左侧拖拽一个组件到画布时：

1. 左侧组件项把以下轻量信息写入 `dataTransfer`
   - `componentId`
   - `componentType`
   - `name`
   - `configVersion`
   - `defaultSize`
   - `minSize`
2. 画布接收到 drop 事件
3. 页面立即创建一条布局数据 `CanvasLayoutItem`
4. 页面同时创建一条实例数据 `CanvasComponentInstance`
5. 新实例初始状态为 `loading`

此时用户会先看到一个占位卡片，而不是等待接口完成后再出现卡片。

## 4.3 请求组件详情

实例创建后，页面马上调用详情接口：

```http
GET /api/component-palette/:componentId/detail
```

详情接口返回三层协议：

- `renderSchema`
- `dataSchema`
- `actionSchema`

页面将这些协议保存到实例快照里。

如果详情加载成功：

- 实例状态切为 `ready`

如果详情加载失败：

- 实例状态切为 `error`
- 卡片内显示错误提示和“重试”按钮

## 4.4 进入运行态

实例状态进入 `ready` 后，不代表数据已经准备完成，只代表：

- 组件结构协议已到位
- 数据协议已到位
- 动作协议已到位

后续还要根据 `dataSchema` 决定是否继续加载主数据源。

### 情况 A：静态数据

如果：

```ts
dataSchema.mode === 'static'
```

则直接使用：

```ts
dataSchema.mockData
```

作为组件渲染数据。

### 情况 B：远程数据

如果：

```ts
dataSchema.mode === 'remote'
```

则页面会继续请求主数据源接口。

## 4.5 渲染真实组件

当前页面内的运行时映射关系如下：

### `renderSchema.kind === 'table'`

渲染为：

- `DataTable`

映射关系：

- `renderSchema.props.columns` -> `DataTable.columns`
- `renderSchema.props.actions` -> `DataTable.actions`
- `runtimeData` -> `DataTable.data`

### `renderSchema.kind === 'form'`

渲染为：

- `JsonForm`

映射关系：

- `renderSchema.props.fields` -> `JsonForm.config.fields`

### `renderSchema.kind === 'composite'`

当前只支持：

- `table`
- `modalForm`
- `modal`

映射关系：

- `renderSchema.props.table` -> 表格配置
- `renderSchema.props.modalForm` -> 弹窗表单配置
- `renderSchema.props.modal` -> 弹窗配置

当前实际业务效果是：

- 画布里显示表格
- 表格操作列中有“编辑”按钮
- 点击“编辑”后打开弹窗表单
- 提交后调用动作接口，再刷新主数据源

## 5. 页面内部状态模型

当前页面内部实际维护了四类核心状态。

## 5.1 布局状态

用于描述 React Grid Layout 的位置和尺寸：

```ts
interface CanvasLayoutItem {
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
```

## 5.2 实例状态

用于描述每个画布卡片的业务状态和协议快照：

```ts
interface CanvasComponentInstance {
  id: string
  componentId: string
  componentType: string
  name: string
  configVersion: string
  status: 'loading' | 'ready' | 'error'
  renderSchema?: ComponentRenderSchema
  dataSchema?: ComponentDataSchema
  actionSchema?: ComponentActionSchema
  errorMessage?: string
}
```

## 5.3 运行时数据状态

按实例 `id` 存储主数据源返回的数据：

- `runtimeData[instanceId]`

## 5.4 运行时分页状态

按实例 `id` 存储服务端分页信息：

```ts
interface InstancePaginationState {
  page: number
  pageSize: number
  total: number
}
```

这意味着每个画布实例都可以拥有自己独立的分页状态，而不会互相影响。

## 6. 当前交互流程

## 6.1 拖入流程

1. 页面加载组件列表
2. 用户从左侧拖动一个组件
3. 释放到画布
4. 页面创建布局项
5. 页面创建 `loading` 实例
6. 页面请求详情接口
7. 详情成功后实例进入 `ready`
8. 如果有远程主数据源，则继续请求主数据源
9. 主数据源返回后，表格展示真实数据

## 6.2 错误重试流程

1. 详情接口失败
2. 实例状态切为 `error`
3. 用户点击“重试”
4. 实例重新切回 `loading`
5. 页面再次请求详情接口

## 6.3 编辑提交流程

1. 用户点击表格行上的“编辑”
2. 页面根据 `modalForm` 协议渲染弹窗表单
3. 表单默认值来自当前行数据
4. 用户点击确认后，调用 `actionSchema.submit.api`
5. 提交成功后，重新请求当前实例主数据源
6. 表格刷新当前页数据

## 6.4 分页流程

1. 主数据源开启了分页协议
2. 页面在请求主数据源时自动附带 `page` 和 `pageSize`
3. 主数据源返回：
   - 当前页列表
   - 总条数
4. 页面同步更新实例级分页状态
5. 用户切页后再次请求主数据源
6. 用户切换每页条数后，页码重置为第 1 页，再请求主数据源

## 7. 接口职责划分

场景 2 目前依赖四类接口。

## 7.1 组件列表接口

```http
GET /api/component-palette
```

职责：

- 提供左侧菜单栏的组件元信息
- 提供拖入时需要的轻量数据

不负责：

- 返回完整渲染协议
- 返回完整表单 schema
- 返回数据源配置细节

详细文档见 [component-palette-api.md](/Users/sunny/work2026/fe-base/docs/api/component-palette-api.md)。

## 7.2 组件详情接口

```http
GET /api/component-palette/:componentId/detail
```

职责：

- 返回组件实例化所需的完整协议快照
- 决定前端要渲染什么结构
- 决定主数据源从哪里获取
- 决定交互动作如何执行

详细文档见 [component-detail-api.md](/Users/sunny/work2026/fe-base/docs/api/component-detail-api.md)。

## 7.3 主数据源接口

当前 mock 示例：

```http
GET /api/users?page=1&pageSize=10
```

职责：

- 返回表格实际渲染的数据
- 返回服务端分页总数

这是业务数据接口，不是组件配置接口。

## 7.4 动作提交接口

当前 mock 示例：

```http
POST /api/users/update
```

职责：

- 处理编辑表单提交
- 更新业务数据
- 成功后让前端刷新主数据源

## 8. 推荐的真实接口协议

下面是当前 scene 2 与后端对接时建议直接遵守的协议。

## 8.1 统一返回结构

建议所有接口统一使用：

```ts
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

## 8.2 组件列表接口协议

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

约束：

- 这里不要返回完整组件 JSON
- 这里只返回左侧展示和拖拽创建实例所需的最小信息

## 8.3 组件详情接口协议

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

这是当前 scene 2 最核心的协议。

## 8.4 主数据源接口协议

如果开启了服务端分页：

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

其中：

- `list` 是当前页数据
- `total` 是总条数
- `page` 是当前页码
- `pageSize` 是当前每页条数

## 9. 后端需要重点保证的字段

为了让当前前端实现可以无缝接真实接口，后端至少要保证以下几点。

## 9.1 组件列表接口

- `id` 必须稳定且唯一
- `defaultSize` 必须存在
- `minSize` 最好存在
- `hasDetail` 为 `true` 时，详情接口必须可用

## 9.2 组件详情接口

- `renderSchema.kind` 必须合法
- `renderSchema.props` 的结构必须和对应 kind 匹配
- `dataSchema.mode === 'remote'` 时，必须提供 `source`
- `actionSchema` 中的 `api.url` 必须是前端可调用的真实地址

## 9.3 主数据源接口

如果开启分页：

- 返回结构里必须有列表数据
- 返回结构里必须能解析出总数
- 分页参数名称必须与详情协议中定义的一致

例如：

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

那么后端就必须支持：

- `page`
- `pageSize`

并保证返回体里：

- `data.list`
- `data.total`

确实存在。

## 10. 当前实现的边界

当前 scene 2 还不是完整低代码平台，只是一个最小可运行的实例化与运行时验证版本。

当前明确未覆盖：

- 多数据源
- 新建/删除/批量动作
- 右侧属性面板编辑协议
- 组件实例持久化保存
- 复杂联动事件编排
- 多种 `composite` 组合模式
- 远程搜索、远程排序协议

所以后端现阶段只需要先围绕下面这条主链路完成对接即可：

- 组件列表
- 组件详情
- 主数据源
- 提交动作接口

## 11. 推荐对接顺序

如果后端开始对接真实接口，建议按下面顺序推进。

1. 先完成 `GET /api/component-palette`
2. 再完成 `GET /api/component-palette/:componentId/detail`
3. 再完成详情里声明的主数据源接口
4. 最后完成 `actionSchema` 对应的提交接口

这样前端可以逐步把 `msw` mock 替换成真实接口，而不用一次性全部切换。

## 12. 当前 mock 示例对应的完整链路

当前本地开发环境的 mock 链路如下：

1. `GET /api/component-palette`
   - 返回左侧一个“带编辑操作的表格”组件
2. `GET /api/component-palette/table-with-edit-actions/detail`
   - 返回 `composite` 协议
3. `GET /api/users?page=1&pageSize=10`
   - 返回表格第一页数据和总数
4. `POST /api/users/update`
   - 更新表格中的用户数据
5. 前端再次请求 `/api/users`
   - 刷新表格当前页

## 13. 相关文档

- 导航页：[README.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/README.md)
- 后端对接文档：[backend-api.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/backend-api.md)
- 组件列表接口文档：[component-palette-api.md](/Users/sunny/work2026/fe-base/docs/api/component-palette-api.md)
- 组件详情接口文档：[component-detail-api.md](/Users/sunny/work2026/fe-base/docs/api/component-detail-api.md)
- 运行时设计文档：[2026-04-03-scene-2-runtime-renderer-design.md](/Users/sunny/work2026/fe-base/docs/superpowers/specs/2026-04-03-scene-2-runtime-renderer-design.md)
- 实例详情流设计文档：[2026-04-03-scene-2-instance-detail-flow-design.md](/Users/sunny/work2026/fe-base/docs/superpowers/specs/2026-04-03-scene-2-instance-detail-flow-design.md)

```http
POST /api/users/update
```

职责：

- 处理编辑表单提交
- 更新业务数据
- 成功后让前端刷新主数据源

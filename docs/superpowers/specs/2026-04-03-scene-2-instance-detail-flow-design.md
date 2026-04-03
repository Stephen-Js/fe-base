# Drag Layout Scene 2 实例详情流设计文档

## 概述

为 `DragLayoutScene2Page` 增加真实拖入实例化能力。用户从左侧组件列表拖入画布时，页面立即生成一个占位实例卡片，并异步请求组件详情接口。详情请求成功后，实例状态切换为 `ready`；失败后，实例状态切换为 `error` 并允许重试。

当前阶段继续使用 `msw` mock 接口，并要求接口结构、类型定义和未来真实 API 保持一致，同时补充接口文档。

## 目标

- 左侧组件列表支持拖拽到画布
- 拖入时立即生成画布实例
- 实例支持 `loading / ready / error` 状态
- 异步请求组件详情接口
- 失败时实例卡片显示错误状态和重试入口
- `msw` mock 与真实 API 共用同一套类型
- 更新接口文档

## 非目标

- 不实现实例配置保存
- 不实现右侧属性面板联动编辑
- 不实现实例持久化
- 不实现真正的 JSON 动态渲染器
- 不实现多组件详情接口批量预取

## 核心思路

将画布状态拆成两层：

1. **布局层**
   只维护 React Grid Layout 所需的位置和尺寸信息

2. **实例层**
   维护每个卡片的业务状态、组件详情和错误信息

这样可以避免把异步加载状态、配置 JSON 和布局坐标混在一起。

## 数据模型

### 布局项

```ts
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
```

### 实例状态

```ts
export type CanvasInstanceStatus = 'loading' | 'ready' | 'error'
```

### 画布实例

```ts
export interface CanvasComponentInstance {
  id: string
  componentId: string
  componentType: string
  name: string
  configVersion: string
  status: CanvasInstanceStatus
  config?: Record<string, unknown>
  errorMessage?: string
}
```

### 组件详情结构

```ts
export interface ComponentDetailMeta {
  id: string
  type: string
  name: string
  category: string
  configVersion: string
  renderer: string
}

export interface ComponentRenderSchema {
  kind: 'table' | 'form' | 'composite'
  props: Record<string, unknown>
  slots?: Record<string, unknown>
  events?: Record<string, unknown>
}

export interface ComponentDataSchema {
  mode: 'static' | 'remote'
  source?: {
    url: string
    method: 'GET' | 'POST'
    query?: Record<string, unknown>
    body?: Record<string, unknown>
    headers?: Record<string, string>
    dataPath?: string
    pagination?: {
      enabled: boolean
      pageParam?: string
      pageSizeParam?: string
      listPath?: string
      totalPath?: string
    }
  }
  mockData?: unknown
}

export interface ComponentActionSchema {
  actions: Array<{
    id: string
    type: string
    label?: string
    target?: string
    payload?: Record<string, unknown>
    api?: {
      url: string
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    }
  }>
}

export interface ComponentDetailData {
  component: ComponentDetailMeta
  renderSchema: ComponentRenderSchema
  dataSchema: ComponentDataSchema
  actionSchema?: ComponentActionSchema
}
```

## 交互流程

### 拖入流程

1. 用户从左侧菜单拖起组件项
2. 左侧将 `componentId`、`componentType`、默认尺寸等轻量信息写入 `dataTransfer`
3. 用户在画布释放鼠标
4. 页面立即生成：
   - 一条布局项
   - 一条 `loading` 状态的实例
5. 卡片先显示占位状态
6. 页面根据 `componentId` 请求详情接口
7. 请求成功后，实例切换为 `ready`
8. 若详情中的 `dataSchema.mode === 'remote'`，继续请求主数据源
9. 若开启服务端分页，则按实例当前页参数请求主数据源
10. 主数据源返回后，实例渲染真实数据
11. 请求失败后，实例切换为 `error`

### 重试流程

1. 用户点击错误卡片中的“重试”
2. 实例状态切回 `loading`
3. 重新请求组件详情接口
4. 根据结果切换为 `ready` 或 `error`

## 画布卡片表现

### `loading`

- 标题显示组件名
- 内容区域显示“加载组件配置中...”

### `ready`

当前阶段的 `ready` 语义是“详情协议已经加载完成，可进入运行态渲染”。

若 `dataSchema.mode === 'remote'`，还需要继续请求主数据源后，组件才能展示真实表格数据。

若主数据源开启了服务端分页，还需要维护当前页、每页条数和总条数。

建议展示：

- 组件名
- 配置版本
- `renderSchema.kind`
- 若 `renderSchema.props` 中包含 `columns`、`fields` 等关键信息，可显示数量摘要
- 若存在 `actionSchema`，可显示动作数量摘要

### `error`

- 显示错误提示
- 显示“重试”按钮

## 接口设计

### 组件列表接口

保持现有接口不变：

```http
GET /api/component-palette
```

### 组件详情接口

新增：

```http
GET /api/component-palette/:componentId/detail
```

响应结构：

```ts
ApiResponse<ComponentDetailData>
```

## `msw` 策略

在 `apps/web` 开发环境继续通过 `msw` mock：

- `/api/component-palette`
- `/api/component-palette/:componentId/detail`
- `dataSchema.source` 对应的主数据源接口

要求：

- 两个接口都使用共享类型
- 详情接口 mock 返回与真实后端目标结构一致
- 主数据源接口同样使用 `msw` mock
- 主数据源分页返回结构与真实后端一致

## 关于 JSON 驱动组件的兼容性

该详情协议按三层结构设计：

- `renderSchema`
  决定组件渲染哪些元素和结构
- `dataSchema`
  决定组件主数据源从哪里获取
- `actionSchema`
  决定组件有哪些交互动作以及动作如何执行

这样能够兼容：

- JSON 驱动表格组件
- JSON 驱动表单组件
- 表格 + 表单弹窗这类 CRUD 组合式组件

其中：

- 表格列、表单字段、弹窗结构归入 `renderSchema`
- 主列表数据源归入 `dataSchema`
- 编辑、提交、删除、弹窗开关等动作归入 `actionSchema`

## 文件规划

```text
packages/types/src/index.ts
  新增实例状态和组件详情类型

apps/web/src/mocks/handlers/component-palette.ts
  增加组件详情接口 mock

packages/pages/src/drag-layout-scene-2-page.tsx
  增加拖拽、画布布局状态、实例状态与详情加载逻辑
```

## 实现策略

当前阶段不直接复用现有 `DragLayoutPage` 的完整 `Canvas` 组件，而是优先参考它的拖入模式和 `React Grid Layout` 的 drop 回调，在 `scene 2` 内先建立面向“实例状态流”的页面实现。

原因：

- `scene 2` 当前需要的不只是拖入，还需要实例状态机
- 现有 `Canvas` 更偏本地 `componentRegistry` 直接渲染
- 若强行复用，容易在当前阶段把“布局层”和“详情层”职责混在一起

后续如果 `scene 2` 方案稳定，再反向抽象公共画布组件更合理。

## 验证建议

至少验证以下几点：

- 左侧组件项可以拖入画布
- 拖入后立即出现 `loading` 占位实例
- 详情接口成功时实例切换为 `ready`
- 详情接口失败时实例切换为 `error`
- 错误态重试后可以重新发起详情请求
- `msw` 仍受环境变量控制

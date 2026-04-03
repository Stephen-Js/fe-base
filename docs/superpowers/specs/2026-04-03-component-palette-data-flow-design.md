# 左侧组件列表接口化设计文档

## 概述

为 `DragLayoutScene2Page` 的左侧组件列表建立面向后端接口的获取方式，并在 `apps/web` 开发环境使用 `msw` 进行本地 mock。`msw`、页面请求层和未来真实 API 共享同一份数据类型，避免字段漂移和重复定义。

## 目标

- 左侧组件列表通过真实 HTTP 请求方式获取
- `apps/web` 开发环境使用 `msw` 拦截并返回 mock 数据
- 统一复用 `@repo/types` 中的 `ApiResponse` 及组件列表相关类型
- 页面具备 `loading / error / success` 三态
- 为未来接入真实后端预留稳定的数据边界

## 非目标

- 不实现组件详情接口
- 不实现拖拽到画布后的详情拉取
- 不实现画布实例化逻辑
- 不实现右侧属性联动
- 不扩展到 `desktop` 或 `mobile`

## 需求总结

| 项目 | 选择 |
|------|------|
| 接口方案 | 真实请求路径 + `msw` mock |
| mock 启用范围 | `apps/web` 开发环境 |
| 响应结构 | 复用 `@repo/types` 的 `ApiResponse<T>` |
| 列表字段 | 仅轻量元信息，不包含完整 JSON 配置 |
| 页面逻辑 | 请求并渲染左侧组件列表三态 |
| 接口文档 | 单独 Markdown 文件保存 |

## 推荐方案

采用“页面请求 + `msw` 开发环境 mock + 共享类型定义”的方案：

- 页面通过 `@repo/api` 的 `apiGet` 请求 `/component-palette`
- `apps/web` 在开发环境初始化 `msw`
- `msw` 返回与真实 API 完全一致的 `ApiResponse<ComponentPaletteListData>`
- 左侧组件列表只消费轻量元信息

这样实现后，未来切换到真实后端时：

- 页面请求代码不需要改
- 返回类型不需要改
- 只需要移除或关闭本地 mock

## 类型设计

### 复用类型

继续使用 `@repo/types` 里已有的：

```ts
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

### 新增组件列表类型

在 `@repo/types` 中新增：

```ts
export interface LayoutSize {
  w: number
  h: number
}

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

export interface ComponentPaletteListData {
  list: ComponentPaletteItem[]
}
```

## 数据边界

左侧组件列表接口只返回轻量元信息，不返回完整 JSON 配置。

保留字段：

- 组件展示名称
- 描述
- 分类
- 标签
- 图标
- 默认尺寸
- 最小尺寸
- 配置版本
- 是否存在详情接口

不返回字段：

- 完整表格列配置
- 操作栏按钮配置
- 表单 schema
- 校验规则
- 数据源定义
- 属性面板配置

## 请求路径

页面请求路径固定为：

```text
/api/component-palette
```

由于 `apiClient` 已配置浏览器端 `baseURL` 为 `/api`，页面层调用应写为：

```ts
apiGet<ComponentPaletteListData>('/component-palette')
```

## 页面行为

### 成功态

左侧面板渲染接口返回的组件列表，每一项展示：

- 图标
- 名称
- 描述
- 分类
- 默认尺寸

### 加载态

组件列表区域显示简单骨架或加载提示。

### 错误态

当请求失败时，显示错误提示和重试按钮。

## `msw` 接入策略

### 启用范围

仅在 `apps/web` 开发环境启用：

- `NODE_ENV === 'development'`
- `NEXT_PUBLIC_ENABLE_MSW !== 'false'`
- 浏览器端运行

即：

- 开发环境默认开启 `msw`
- 当设置 `NEXT_PUBLIC_ENABLE_MSW=false` 时，关闭本地 mock
- 非开发环境始终不启动 `msw`

### 文件职责

```text
apps/web/src/mocks/
├── browser.ts                      # setupWorker
└── handlers/
    ├── component-palette.ts        # 左侧组件列表接口 mock
    └── index.ts                    # handlers 汇总
```

### 启动方式

在 `apps/web` 根布局处通过客户端 provider 或初始化组件动态加载 `msw` worker。

要求：

- 仅开发环境启动
- 默认开启，可通过环境变量显式关闭
- 不影响生产构建
- 不影响服务端渲染

## Mock 数据设计

第一阶段只提供一个组件：

- 带编辑操作的表格组件

示例字段：

```ts
{
  id: 'table-with-edit-actions',
  type: 'table',
  name: '带编辑操作的表格',
  description: '支持操作栏编辑按钮的表格组件',
  category: 'data',
  tags: ['table', 'actions', 'edit'],
  icon: 'table',
  defaultSize: { w: 6, h: 5 },
  minSize: { w: 5, h: 4 },
  configVersion: '1.0.0',
  hasDetail: true
}
```

## 错误处理

页面请求异常时：

- 捕获 `apiGet` 抛出的错误
- 在左侧菜单区域显示失败提示
- 提供重试按钮重新发起请求

不在本阶段实现更复杂的 toast 或全局错误处理。

## 文件规划

```text
packages/types/src/index.ts
  新增组件列表共享类型

packages/pages/src/drag-layout-scene-2-page.tsx
  请求并渲染左侧组件列表

apps/web/src/mocks/browser.ts
  初始化 msw worker

apps/web/src/mocks/handlers/index.ts
  汇总 mock handlers

apps/web/src/mocks/handlers/component-palette.ts
  组件列表 mock 接口与数据

apps/web/src/app/layout.tsx
或独立客户端 provider
  开发环境启动 msw
```

## 验证建议

至少验证以下几点：

- 开发环境下页面能请求到 `/api/component-palette`
- `msw` 返回的数据满足 `ApiResponse<ComponentPaletteListData>`
- 左侧组件列表可以正常渲染 mock 数据
- 加载态与错误态都能正常显示
- 生产构建不因 `msw` 初始化报错

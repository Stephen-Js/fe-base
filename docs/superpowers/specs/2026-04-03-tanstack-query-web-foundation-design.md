# Web 全局 TanStack Query 基础设施设计文档

## 概述

为 `apps/web` 建立全局 `TanStack Query` 查询基础设施，并将 `DragLayoutScene2Page` 左侧组件列表从手写 `useEffect + useState` 请求逻辑迁移到 `useQuery`。`msw` 继续只负责开发环境下的 HTTP mock，接口请求仍通过 `@repo/api` 发起。

## 目标

- 在 `apps/web` 根层挂载全局 `QueryClientProvider`
- 为后续 palette、detail、save 等接口查询提供统一基础设施
- 将左侧组件列表迁移到 `TanStack Query`
- 保持 `msw` 与真实 API 共用同一份数据类型
- 保留当前 `msw` 环境变量开关逻辑

## 非目标

- 不接入 React Query Devtools
- 不抽公共 query hooks
- 不实现组件详情查询
- 不实现 mutation / save / optimistic update
- 不实现 SSR 预取与 hydration

## 需求总结

| 项目 | 选择 |
|------|------|
| 查询库 | TanStack Query |
| Provider 范围 | `apps/web` 全局 |
| 页面改造范围 | 仅 `drag-layout-scene-2` 左侧组件列表 |
| 请求层 | 继续复用 `@repo/api` |
| mock 层 | 继续使用 `msw` |
| 默认行为 | 开发环境默认启用 `msw`，可通过环境变量关闭 |

## 推荐方案

采用“`apps/web` 全局 `QueryClientProvider` + 页面内直接 `useQuery`”的方案：

- 在 `apps/web/src/components/query-provider.tsx` 中初始化 `QueryClient`
- 在 `apps/web/src/app/layout.tsx` 中挂载 `QueryProvider`
- `DragLayoutScene2Page` 直接使用 `useQuery`
- 不在当前阶段提前抽象公共 query hook

## 架构边界

### `@repo/api`

职责：

- 发起 HTTP 请求
- 返回 `ApiResponse<T>`

不负责：

- 缓存
- 去重
- 重试策略
- UI 状态管理

### `msw`

职责：

- 在开发环境拦截 HTTP 请求
- 返回与真实 API 同结构的数据

不负责：

- 组件状态
- 缓存
- 重试

### TanStack Query

职责：

- 缓存请求结果
- 处理 `loading / error / success`
- 去重
- 重试
- 暴露 `refetch`

## Provider 设计

新增：

```text
apps/web/src/components/query-provider.tsx
```

职责：

- 创建 `QueryClient`
- 设置默认查询策略
- 包裹 `QueryClientProvider`

放置位置：

- `apps/web/src/app/layout.tsx`

推荐组合顺序：

```tsx
<body>
  <MockProvider>
    <QueryProvider>{children}</QueryProvider>
  </MockProvider>
</body>
```

原因：

- `MockProvider` 先确保开发环境 mock 已准备好
- `QueryProvider` 再承载页面内部查询逻辑

## 默认查询策略

`QueryClient` 默认配置建议如下：

```ts
{
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 30 * 1000,
    },
  },
}
```

选择理由：

- 当前是配置型工作台，不需要高频自动刷新
- 减少开发时窗口切换造成的噪音请求
- 给一定 `staleTime` 以降低短时间内重复请求

## 页面查询设计

`DragLayoutScene2Page` 左侧组件列表改为：

```ts
useQuery({
  queryKey: ['component-palette'],
  queryFn: () => apiGet<ComponentPaletteListData>('/component-palette'),
})
```

页面消费字段：

- `isLoading`
- `isError`
- `data`
- `refetch`

列表渲染逻辑保持当前三态结构：

- 加载中
- 加载失败 + 重试按钮
- 成功渲染组件项

## 数据结构

继续复用现有共享类型：

- `ApiResponse<T>`
- `ComponentPaletteItem`
- `ComponentPaletteListData`

不新增新的数据协议层。

## 与当前问题的关系

当前页面使用 `useEffect` 在开发环境下可能出现重复请求观感。迁移到 `TanStack Query` 后：

- 请求行为由查询层统一接管
- 缓存和去重更稳定
- 后续组件详情查询也能沿用相同模式

## 文件规划

```text
apps/web/src/components/query-provider.tsx
  新增全局 QueryClientProvider

apps/web/src/app/layout.tsx
  接入 QueryProvider

packages/pages/src/drag-layout-scene-2-page.tsx
  左侧组件列表改为 useQuery
```

## 验证建议

至少验证以下几点：

- `apps/web` 能正常编译并挂载全局 `QueryClientProvider`
- `DragLayoutScene2Page` 能通过 `useQuery` 拉取 palette 列表
- 左侧列表仍然保留 loading / error / success 三态
- 生产构建不受 `QueryProvider` 接入影响

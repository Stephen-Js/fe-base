# 组件详情接口文档

## 接口说明

用于在拖拽布局场景中，根据组件 `id` 获取组件详情配置。该接口在用户将组件拖入画布后调用，用于生成画布实例的配置快照。

当前定位：

- 组件实例化时的详情数据源
- 返回完整组件配置 JSON
- 与组件列表接口配合使用

## 请求信息

**Method**

```http
GET
```

**Path**

```http
/api/component-palette/:componentId/detail
```

## 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `componentId` | `string` | 是 | 组件唯一标识 |

## 响应结构

统一返回格式复用 `@repo/types` 中的 `ApiResponse<T>`：

```ts
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
```

## 业务数据结构

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

interface ComponentDataSchema {
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

interface ComponentActionSchema {
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

interface ComponentDetailData {
  component: ComponentDetailMeta
  renderSchema: ComponentRenderSchema
  dataSchema: ComponentDataSchema
  actionSchema?: ComponentActionSchema
}
```

最终响应类型：

```ts
ApiResponse<ComponentDetailData>
```

## 运行时说明

该接口返回的是组件实例的协议定义，不等同于组件已经拿到运行数据。

当：

- `dataSchema.mode === 'remote'`
- 且存在 `dataSchema.source`

前端在实例进入 `ready` 状态后，还应继续根据 `dataSchema.source` 请求主数据源，再将返回数据渲染到表格或组合组件中。

也就是说：

1. 详情接口返回渲染协议与数据协议
2. 前端根据详情协议进入 `ready`
3. 若主数据源为远程接口，则继续请求主数据源
4. 最终将主数据源返回的数据展示在组件中

若 `dataSchema.source.pagination?.enabled === true`，前端应按分页协议请求主数据源，并将返回总数同步给表格分页器。

推荐默认值：

- `pageParam`: `page`
- `pageSizeParam`: `pageSize`
- `listPath`: `data.list`
- `totalPath`: `data.total`

## 成功响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "component": {
      "id": "table-with-edit-actions",
      "type": "table",
      "name": "带编辑操作的表格",
      "category": "data",
      "configVersion": "1.0.0",
      "renderer": "crud-table"
    },
    "renderSchema": {
      "kind": "composite",
      "props": {
        "table": {
          "columns": [
            { "id": "name", "header": "姓名", "accessor": "name" },
            { "id": "email", "header": "邮箱", "accessor": "email" },
            { "id": "status", "header": "状态", "accessor": "status" }
          ],
          "actions": {
            "id": "actions",
            "header": "操作",
            "buttons": [
              { "id": "edit", "label": "编辑", "variant": "ghost" }
            ]
          }
        },
        "modalForm": {
          "fields": [
            { "name": "name", "type": "text", "label": "姓名" },
            { "name": "email", "type": "email", "label": "邮箱" }
          ]
        },
        "modal": {
          "title": "编辑用户",
          "confirmText": "保存",
          "cancelText": "取消"
        }
      }
    },
    "dataSchema": {
      "mode": "remote",
      "source": {
        "url": "/api/users",
        "method": "GET",
        "dataPath": "data.list",
        "pagination": {
          "enabled": true,
          "pageParam": "page",
          "pageSizeParam": "pageSize",
          "listPath": "data.list",
          "totalPath": "data.total"
        }
      }
    },
    "actionSchema": {
      "actions": [
        {
          "id": "edit",
          "type": "open-modal",
          "target": "modalForm"
        },
        {
          "id": "submit",
          "type": "submit-form",
          "target": "modalForm",
          "api": {
            "url": "/api/users/update",
            "method": "POST"
          }
        }
      ]
    }
  }
}
```

## 错误响应示例

```json
{
  "code": 40401,
  "message": "组件详情不存在",
  "data": {
    "component": {
      "id": "unknown-component",
      "type": "unknown",
      "name": "未知组件",
      "category": "unknown",
      "configVersion": "0.0.0",
      "renderer": "unknown"
    },
    "renderSchema": {
      "kind": "table",
      "props": {}
    },
    "dataSchema": {
      "mode": "static",
      "mockData": []
    }
  }
}
```

## 本地 Mock 说明

`apps/web` 在开发环境下默认通过 `msw` mock 该接口。

环境变量规则：

```env
NEXT_PUBLIC_ENABLE_MSW=false
```

说明：

- 不配置时，开发环境默认开启 mock
- 设置为 `false` 时，开发环境关闭 mock，走真实接口
- 非开发环境始终不启用 `msw`

当前开发阶段中，`dataSchema.source` 所对应的主数据源接口也同样通过 `msw` mock。

## 服务端分页约定

当前阶段表格远程数据源支持单主数据源下的服务端分页。

当：

- `dataSchema.source.pagination?.enabled === true`

前端会在请求主数据源时自动附带分页参数，并按协议路径读取列表与总数。

## 设计约束

- 组件列表接口只返回轻量元信息
- 组件详情接口返回三层协议：
  - `renderSchema`
  - `dataSchema`
  - `actionSchema`
- 画布实例创建时应保存一份实例级配置快照，而不是每次渲染都重新查详情
- 当前阶段 `dataSchema` 仅支持单个主数据源，后续可扩展为多数据源

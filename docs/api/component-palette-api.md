# 组件列表接口文档

## 接口说明

用于获取拖拽布局场景左侧菜单栏中的组件列表。

当前定位：

- 左侧组件选择面板数据源
- 返回轻量组件元信息
- 不返回完整组件 JSON 配置

## 请求信息

**Method**

```http
GET
```

**Path**

```http
/api/component-palette
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

最终响应类型：

```ts
ApiResponse<ComponentPaletteListData>
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 组件唯一标识 |
| `type` | `string` | 是 | 组件类型，如 `table` |
| `name` | `string` | 是 | 组件名称 |
| `description` | `string` | 是 | 组件描述 |
| `category` | `string` | 是 | 组件分类 |
| `tags` | `string[]` | 是 | 组件标签 |
| `icon` | `string` | 是 | 图标标识符 |
| `thumbnail` | `string` | 否 | 缩略图地址 |
| `defaultSize` | `LayoutSize` | 是 | 默认拖入尺寸 |
| `minSize` | `LayoutSize` | 是 | 最小尺寸 |
| `configVersion` | `string` | 是 | 配置版本号 |
| `hasDetail` | `boolean` | 是 | 是否支持详情接口 |

## 成功响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "table-with-edit-actions",
        "type": "table",
        "name": "带编辑操作的表格",
        "description": "支持操作栏编辑按钮的表格组件",
        "category": "data",
        "tags": ["table", "actions", "edit"],
        "icon": "table",
        "defaultSize": { "w": 6, "h": 5 },
        "minSize": { "w": 5, "h": 4 },
        "configVersion": "1.0.0",
        "hasDetail": true
      }
    ]
  }
}
```

## 错误响应示例

```json
{
  "code": 50001,
  "message": "组件列表获取失败",
  "data": {
    "list": []
  }
}
```

## 设计约束

该接口不返回完整组件 JSON 配置。

不应包含：

- 表格列配置
- 操作栏配置
- 表单 schema
- 校验规则
- 属性面板 schema
- 默认数据源配置

完整组件配置应在未来通过组件详情接口按需获取。

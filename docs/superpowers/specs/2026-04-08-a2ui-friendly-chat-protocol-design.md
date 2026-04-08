# Taro Chat 面向 A2UI 演进的消息协议设计

## 背景

当前 Taro 聊天 mock 使用的是纯文本消息模型：

- 消息体只有一个 `content: string`
- 流式输出通过对字符串逐步 `slice` 来模拟
- 渲染层只支持在单个气泡中展示纯文本

这对文本流式演示已经够用，但无法表达或流式输出以下内容：

- 图片
- Markdown / 富文本
- 表单
- 卡片与工具结果
- 结构化状态信息

这份设计的目标，是在当前 Taro 聊天页场景下定义一套可落地的协议，同时为后续演进到更接近 A2UI 的操作级协议预留清晰路径。

## 目标

- 用块级消息模型替换当前的纯文本消息模型
- 支持文本和结构化内容的增量流式输出
- 保持渲染模型声明式、组件安全
- 保持协议对 Taro / H5 友好
- 为未来演进到类似 A2UI 的操作级模型留出兼容空间

## 非目标

- 本阶段不实现通用 UI Runtime
- 本阶段不支持任意可执行 UI 代码或原始 HTML 注入
- 本阶段不直接完整采用上游 A2UI 协议
- 本阶段不一次性覆盖所有可能的 UI 组件类型

## 决策

采用方案 2：块级增量流式协议。

协议仍然以“消息”为核心，但每条消息包含有序的 `chunks`。流式事件不再只是持续修改一个字符串，而是围绕消息及其块进行追加与补丁更新。这样既能保持当前聊天架构不被推翻，也能引入后续演进所需的结构化基础。

## 为什么选择方案 2

### 推荐方案

方案 2 最适合当前代码库，原因很直接：

- 它扩展的是现有 `messages[]` 心智模型，而不是彻底替换
- 它可以支持结构化内容，而不需要立刻引入通用 UI 树引擎
- 它足以覆盖文本、Markdown、图片、表单、卡片类体验
- 只要现在保留稳定标识和显式 patch 语义，后续就能平滑演进到操作级更新模型

### 备选方案对比

#### 方案 1：仅保留消息级文本 patch

优点：

- 改动最小
- 最容易在当前 mock 上直接套用

缺点：

- 仍然是文本中心模型
- 图片、表单、卡片仍然需要旁路 hack
- 未来迁移到 A2UI 时需要更大规模重构

#### 方案 3：现在直接上操作级 UI 协议

优点：

- 最接近未来的 A2UI 风格
- 长期灵活性最强

缺点：

- 需要立即引入 UI 树管理、操作重放、patch 校验和渲染 Runtime 问题
- 对当前 Taro 聊天页来说明显过重
- 会推迟常见聊天块能力的落地

## 设计原则

- 仅声明式：协议描述“渲染什么”，而不是“执行什么代码”
- 稳定标识：消息和 chunk 都必须有稳定 id
- 支持增量更新：流式事件允许追加 chunk 或 patch chunk
- 组件白名单：前端将协议里的 chunk 类型映射到受信任的本地组件
- 兼容优先：先确保 Taro H5 可用，再保持后续多端可迁移
- 面向 A2UI 演进：保留未来可自然映射到节点和操作模型的概念

## 数据模型

### 消息模型

```ts
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

export type MessageStatus = 'streaming' | 'completed' | 'failed'

export interface ChatMessage {
  id: string
  role: MessageRole
  status: MessageStatus
  createdAt: number
  updatedAt: number
  chunks: MessageChunk[]
  metadata?: Record<string, unknown>
}
```

### Chunk 模型

```ts
export type ChunkType =
  | 'text'
  | 'markdown'
  | 'image'
  | 'form'
  | 'card'
  | 'status'

export type ChunkStatus = 'streaming' | 'completed' | 'failed'

interface ChunkBase {
  id: string
  type: ChunkType
  status: ChunkStatus
  order: number
  metadata?: Record<string, unknown>
}

export interface TextChunk extends ChunkBase {
  type: 'text'
  text: string
}

export interface MarkdownChunk extends ChunkBase {
  type: 'markdown'
  text: string
}

export interface ImageChunk extends ChunkBase {
  type: 'image'
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface FormFieldOption {
  label: string
  value: string
}

export interface FormFieldSchema {
  name: string
  label: string
  fieldType: 'text' | 'textarea' | 'number' | 'select'
  required?: boolean
  placeholder?: string
  options?: FormFieldOption[]
}

export interface FormChunk extends ChunkBase {
  type: 'form'
  formId: string
  title?: string
  submitLabel?: string
  fields: FormFieldSchema[]
}

export interface CardChunk extends ChunkBase {
  type: 'card'
  title: string
  description?: string
  actions?: Array<{
    id: string
    label: string
    actionType: 'submit' | 'link' | 'event'
    value?: string
  }>
}

export interface StatusChunk extends ChunkBase {
  type: 'status'
  tone: 'info' | 'success' | 'warning' | 'error'
  text: string
}

export type MessageChunk =
  | TextChunk
  | MarkdownChunk
  | ImageChunk
  | FormChunk
  | CardChunk
  | StatusChunk
```

## 流式事件模型

第一阶段采用“消息 + chunk 事件流”，而不是直接进入 UI 操作流。

```ts
export type ChatStreamEvent =
  | MessageStartedEvent
  | ChunkAppendedEvent
  | ChunkPatchedEvent
  | MessageCompletedEvent
  | MessageFailedEvent

export interface EventBase {
  eventId: string
  seq: number
  messageId: string
  timestamp: number
}

export interface MessageStartedEvent extends EventBase {
  type: 'message_started'
  role: MessageRole
  metadata?: Record<string, unknown>
}

export interface ChunkAppendedEvent extends EventBase {
  type: 'chunk_appended'
  chunk: MessageChunk
}

export interface ChunkPatchedEvent extends EventBase {
  type: 'chunk_patched'
  chunkId: string
  patch:
    | { op: 'append_text'; text: string }
    | { op: 'replace_text'; text: string }
    | { op: 'set_status'; status: ChunkStatus }
    | { op: 'merge_metadata'; metadata: Record<string, unknown> }
}

export interface MessageCompletedEvent extends EventBase {
  type: 'message_completed'
}

export interface MessageFailedEvent extends EventBase {
  type: 'message_failed'
  errorCode: string
  errorMessage: string
}
```

## 事件语义

### 顺序约束

- 事件按 `seq` 升序应用
- 每个 `messageId` 拥有自己的有序事件流
- 客户端必须忽略重复的 `eventId`

### 消息生命周期

1. `message_started`
2. 一个或多个 `chunk_appended`
3. 可选的 `chunk_patched`
4. `message_completed` 或 `message_failed`

### Chunk 生命周期

- `chunk_appended` 负责向目标消息中引入一个新 chunk
- `chunk_patched` 负责按 `chunkId` 更新既有 chunk
- 仅允许协议定义内的 patch 操作
- 客户端必须拒绝对未知 `chunkId` 的 patch

## 渲染契约

前端不执行任意 payload，只渲染受信任的本地映射：

- `text` -> 纯文本渲染器
- `markdown` -> 受限 Markdown 渲染器
- `image` -> 图片组件
- `form` -> 本地可信表单渲染器
- `card` -> 本地可信卡片渲染器
- `status` -> 行内状态组件

这个约束很关键。协议负责描述数据，组件和执行权仍然掌握在客户端。

## 第一阶段支持范围

对于当前 Taro 应用，第一阶段建议优先支持：

- `text`
- `markdown`
- `image`
- `form`

`card` 和 `status` 虽然第一版可以不完全暴露到 UI，但协议形状现在就应该先定下来，避免后面再改模型。

## 示例载荷

### 示例 1：纯文本流式输出

```json
[
  {
    "type": "message_started",
    "eventId": "e1",
    "seq": 1,
    "messageId": "m1",
    "timestamp": 1760000000000,
    "role": "assistant"
  },
  {
    "type": "chunk_appended",
    "eventId": "e2",
    "seq": 2,
    "messageId": "m1",
    "timestamp": 1760000000010,
    "chunk": {
      "id": "c1",
      "type": "text",
      "status": "streaming",
      "order": 1,
      "text": "你好"
    }
  },
  {
    "type": "chunk_patched",
    "eventId": "e3",
    "seq": 3,
    "messageId": "m1",
    "timestamp": 1760000000020,
    "chunkId": "c1",
    "patch": {
      "op": "append_text",
      "text": "，我来帮你分析。"
    }
  },
  {
    "type": "chunk_patched",
    "eventId": "e4",
    "seq": 4,
    "messageId": "m1",
    "timestamp": 1760000000030,
    "chunkId": "c1",
    "patch": {
      "op": "set_status",
      "status": "completed"
    }
  },
  {
    "type": "message_completed",
    "eventId": "e5",
    "seq": 5,
    "messageId": "m1",
    "timestamp": 1760000000040
  }
]
```

### 示例 2：文本加图片

```json
[
  {
    "type": "message_started",
    "eventId": "e10",
    "seq": 10,
    "messageId": "m2",
    "timestamp": 1760000001000,
    "role": "assistant"
  },
  {
    "type": "chunk_appended",
    "eventId": "e11",
    "seq": 11,
    "messageId": "m2",
    "timestamp": 1760000001010,
    "chunk": {
      "id": "c10",
      "type": "markdown",
      "status": "completed",
      "order": 1,
      "text": "这是推荐示意图："
    }
  },
  {
    "type": "chunk_appended",
    "eventId": "e12",
    "seq": 12,
    "messageId": "m2",
    "timestamp": 1760000001020,
    "chunk": {
      "id": "c11",
      "type": "image",
      "status": "completed",
      "order": 2,
      "url": "https://example.com/mock.png",
      "alt": "推荐示意图"
    }
  },
  {
    "type": "message_completed",
    "eventId": "e13",
    "seq": 13,
    "messageId": "m2",
    "timestamp": 1760000001030
  }
]
```

### 示例 3：文本加表单

```json
[
  {
    "type": "message_started",
    "eventId": "e20",
    "seq": 20,
    "messageId": "m3",
    "timestamp": 1760000002000,
    "role": "assistant"
  },
  {
    "type": "chunk_appended",
    "eventId": "e21",
    "seq": 21,
    "messageId": "m3",
    "timestamp": 1760000002010,
    "chunk": {
      "id": "c20",
      "type": "text",
      "status": "completed",
      "order": 1,
      "text": "请先填写以下信息："
    }
  },
  {
    "type": "chunk_appended",
    "eventId": "e22",
    "seq": 22,
    "messageId": "m3",
    "timestamp": 1760000002020,
    "chunk": {
      "id": "c21",
      "type": "form",
      "status": "completed",
      "order": 2,
      "formId": "lead-form-1",
      "title": "联系信息",
      "submitLabel": "提交",
      "fields": [
        {
          "name": "name",
          "label": "姓名",
          "fieldType": "text",
          "required": true,
          "placeholder": "请输入姓名"
        },
        {
          "name": "phone",
          "label": "手机号",
          "fieldType": "text",
          "required": true,
          "placeholder": "请输入手机号"
        }
      ]
    }
  },
  {
    "type": "message_completed",
    "eventId": "e23",
    "seq": 23,
    "messageId": "m3",
    "timestamp": 1760000002030
  }
]
```

## 客户端状态模型

客户端状态仍然保持消息中心：

```ts
interface ChatState {
  messages: ChatMessage[]
}
```

Reducer 行为建议如下：

- `message_started`：创建消息壳
- `chunk_appended`：按顺序追加 chunk
- `chunk_patched`：更新目标 chunk
- `message_completed`：将消息状态设为 `completed`
- `message_failed`：将消息状态设为 `failed`

这个状态模型明显比通用 UI 树 Runtime 更轻，也更适合当前阶段。

## 错误处理

- 未知事件类型：忽略并记录日志
- 重复 `eventId`：忽略
- `seq` 乱序：第一阶段可先拒绝并记录日志，后续再考虑缓冲
- `chunk_patched` 指向未知 `chunkId`：拒绝并记录日志
- 不支持的 chunk 类型：渲染降级占位，同时把原始 payload 保留在 metadata 里便于排查

## 兼容性约束

为了保持 Taro 兼容性和后续多端可迁移性：

- 不传原始 HTML
- Markdown 仅支持受控、安全的子集
- 表单必须是 schema 驱动的本地组件，而不是服务端下发可执行行为
- chunk props 必须保持为可序列化 JSON
- 渲染决策必须由客户端代码控制，而不是由远端 payload 注入

## 安全约束

- 不接受可执行 JavaScript
- 第一阶段不支持任意 HTML 渲染
- 所有 action 都必须落到本地受信任 handler
- 远程图片等资源应遵循现有应用的安全策略

## 向方案 3 的映射关系

为了让方案 2 后续平滑升级，当前就应该保留这些兼容锚点：

- 每条消息都有稳定的 `messageId`
- 每个 chunk 都有稳定的 `chunkId`
- 每个事件都有稳定的 `eventId` 和递增的 `seq`
- patch 语义必须显式，不能退化成隐式字符串替换

有了这些锚点，后续映射会更顺：

### 方案 2 概念 -> 方案 3 概念

- `message` -> UI 子树根节点或逻辑容器节点
- `chunk` -> 类型化 UI 节点
- `chunk_appended` -> `append_node`
- `chunk_patched` -> `patch_props`
- `message_completed` -> 终态生命周期事件

## 演进计划：方案 2 到方案 3

### Phase A：块协议落地

- 把当前 `content: string` 消息改成 `chunks[]`
- 为 `text`、`markdown`、`image`、`form` 增加 chunk 渲染器
- 实现面向消息 / chunk 的事件 reducer
- 流式逻辑仍然只服务于聊天消息域

### Phase B：丰富 chunk 语义

- 加入 `card` 和 `status`
- 为按钮和表单提交补充 action 载荷约定
- 增加本地交互事件，如 `form_submitted`、`action_clicked`

### Phase C：引入内部节点抽象

- 在 chunk 之下增加标准化 renderer node 结构
- 对外协议仍保持 message / chunk 形式
- 各类 chunk 在内部映射为一个或多个 renderer node

### Phase D：引入操作级事件层

- 增加可选操作事件，例如 `append_node`、`patch_props`、`remove_node`
- 允许部分消息进入操作级更新模式
- 内部先把 chunk 事件翻译为 node 操作，保证向后兼容

### Phase E：对齐 A2UI

- 结合未来选定的 A2UI 版本，对齐节点 schema 命名与 props 约定
- 增加 renderer adapter，把协议节点映射到本地 Taro / Taroify 组件
- 明确哪些抽象继续保留为产品层概念，哪些正式转成 A2UI 原生语义

## 推荐实施顺序

1. 把消息 `content` 替换成 `chunks`
2. 先落地 `text` 和 `markdown` chunk
3. 再实现 `image` chunk
4. 再实现 `form` chunk
5. 把当前 mock stream 从字符串切片改成事件回放
6. 为事件顺序和 patch 应用补 reducer 测试
7. 增加协议适配层，让当前 mock 数据和未来后端载荷共用同一 reducer 入口

## 测试策略

- 为每种事件类型补 reducer 单测
- 覆盖重复事件、未知事件的处理测试
- 为每种支持的 chunk 类型补渲染测试
- 增加文本流、图片展示、表单展示的集成测试
- 为迁移期补兼容测试，确保旧 mock 输入仍可通过适配层工作

## 本文已明确的关键决策

- 当前设计层级：前端消息渲染协议 + 前后端流式事件协议
- 采用方案：方案 2
- 演进姿态：面向 A2UI 演进，但暂不直接变成 A2UI 原生协议
- 首批支持内容：`text`、`markdown`、`image`、`form`

## 总结

这份设计有意避开两个错误方向：

- 继续停留在文本中心协议，导致结构化内容长期无法进入
- 在当前产品需求尚未支撑时，过早构建完整操作级 UI Runtime

方案 2 是当前阶段最合理的中间层。它既适合现有 Taro 聊天页，也能在结构上为后续向方案 3、乃至更接近 A2UI 的模型演进做好准备。

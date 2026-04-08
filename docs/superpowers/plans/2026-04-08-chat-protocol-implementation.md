# Taro Chat 块级消息协议落地 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前 Taro 聊天页从纯文本字符串流式输出改造成基于 `chunks[]` 的块级消息协议，首批支持 `text`、`markdown`、`image`、`form`，并保留向方案 3 / A2UI 风格协议演进的结构锚点。

**Architecture:** 保持现有聊天页的 `messages[]` 状态模型不变，但把 `ChatMessageData` 从 `content: string` 升级为 `chunks: MessageChunk[]`。通过一个纯函数 reducer 解释 `message_started`、`chunk_appended`、`chunk_patched`、`message_completed` 事件；mock 响应不再直接切字符串，而是回放结构化事件流。渲染层由 `ChatMessage` 分发到 chunk renderer，确保前端只渲染受信任的本地组件。

**Tech Stack:** Taro, React, TypeScript, Vitest, Taroify, SCSS

---

## 文件结构与职责

### 需要修改的文件

- Modify: `apps/taro/src/components/chat-message/types.ts`
  - 定义 `MessageStatus`、`ChunkType`、`MessageChunk`、`ChatStreamEvent`、`ChatMessageData`
- Modify: `apps/taro/src/components/chat-message/index.tsx`
  - 从单文本气泡渲染改成按 `chunks[]` 分发渲染
- Modify: `apps/taro/src/components/chat-message/index.scss`
  - 增加 chunk 容器、图片块、表单块、Markdown 块样式
- Modify: `apps/taro/src/hooks/use-stream-chat.ts`
  - 用事件 reducer 和 mock 事件回放替换字符串切片流式逻辑
- Modify: `apps/taro/src/pages/chat/index.tsx`
  - 适配新的消息状态与 chunk 渲染结果，保留输入和滚动行为

### 需要新增的文件

- Create: `apps/taro/src/components/chat-message/renderers.tsx`
  - 统一放置 `text`、`markdown`、`image`、`form` chunk 渲染器
- Create: `apps/taro/src/hooks/chat-stream-reducer.ts`
  - 定义 `applyChatStreamEvent` 和相关辅助函数
- Create: `apps/taro/src/hooks/chat-stream-mock.ts`
  - 提供结构化 mock 响应和事件生成器
- Create: `apps/taro/src/hooks/chat-stream-reducer.test.ts`
  - 覆盖 reducer 的事件应用、顺序与 patch 处理
- Create: `apps/taro/src/components/chat-message/renderers.test.tsx`
  - 覆盖不同 chunk 的渲染输出
- Modify: `apps/taro/src/taroify-migration.test.ts`
  - 扩展或拆分为协议落地相关断言
- Create: `apps/taro/src/chat-protocol-integration.test.tsx`
  - 覆盖文本流、图片显示、表单显示的集成测试

### 可选新增文件

- Create: `apps/taro/src/components/chat-message/markdown.ts`
  - 如果 Markdown 渲染规则稍复杂，可单独封装受控解析逻辑

## Task 1: 定义协议类型并替换消息数据结构

**Files:**
- Modify: `apps/taro/src/components/chat-message/types.ts`
- Test: `apps/taro/src/hooks/chat-stream-reducer.test.ts`

- [ ] **Step 1: 写协议类型测试，明确 reducer 输入输出形状**

```ts
import { describe, expect, it } from 'vitest'
import { applyChatStreamEvent, createEmptyChatState } from '../hooks/chat-stream-reducer'
import type { ChatStreamEvent } from '../components/chat-message/types'

describe('chat stream protocol types', () => {
  it('creates a streaming assistant message shell on message_started', () => {
    const state = createEmptyChatState()
    const event: ChatStreamEvent = {
      type: 'message_started',
      eventId: 'e1',
      seq: 1,
      messageId: 'm1',
      timestamp: 1,
      role: 'assistant',
    }

    const next = applyChatStreamEvent(state, event)

    expect(next.messages).toHaveLength(1)
    expect(next.messages[0]).toMatchObject({
      id: 'm1',
      role: 'assistant',
      status: 'streaming',
      chunks: [],
    })
  })
})
```

- [ ] **Step 2: 运行测试，确认当前实现失败**

Run: `pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts`
Expected: FAIL，提示 `chat-stream-reducer.ts` 或 `ChatStreamEvent` 尚不存在

- [ ] **Step 3: 在 `types.ts` 中引入消息、chunk、事件协议类型**

```ts
export type MessageRoleType = 'system' | 'user' | 'assistant' | 'tool'
export type MessageStatus = 'streaming' | 'completed' | 'failed'
export type ChunkStatus = 'streaming' | 'completed' | 'failed'
export type ChunkType = 'text' | 'markdown' | 'image' | 'form' | 'card' | 'status'

export interface ChunkBase {
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

export interface FormFieldSchema {
  name: string
  label: string
  fieldType: 'text' | 'textarea' | 'number' | 'select'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

export interface FormChunk extends ChunkBase {
  type: 'form'
  formId: string
  title?: string
  submitLabel?: string
  fields: FormFieldSchema[]
}

export type MessageChunk = TextChunk | MarkdownChunk | ImageChunk | FormChunk

export interface ChatMessageData {
  id: string
  role: MessageRoleType
  status: MessageStatus
  chunks: MessageChunk[]
  timestamp: number
  updatedAt: number
}

export type ChatStreamEvent =
  | {
      type: 'message_started'
      eventId: string
      seq: number
      messageId: string
      timestamp: number
      role: MessageRoleType
    }
  | {
      type: 'chunk_appended'
      eventId: string
      seq: number
      messageId: string
      timestamp: number
      chunk: MessageChunk
    }
  | {
      type: 'chunk_patched'
      eventId: string
      seq: number
      messageId: string
      timestamp: number
      chunkId: string
      patch:
        | { op: 'append_text'; text: string }
        | { op: 'replace_text'; text: string }
        | { op: 'set_status'; status: ChunkStatus }
    }
  | {
      type: 'message_completed'
      eventId: string
      seq: number
      messageId: string
      timestamp: number
    }
  | {
      type: 'message_failed'
      eventId: string
      seq: number
      messageId: string
      timestamp: number
      errorCode: string
      errorMessage: string
    }
```

- [ ] **Step 4: 运行类型相关测试，确认协议类型可被消费**

Run: `pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts`
Expected: 仍 FAIL，但错误从“类型不存在”收敛到“reducer 未实现”

- [ ] **Step 5: 提交本任务**

```bash
git add apps/taro/src/components/chat-message/types.ts apps/taro/src/hooks/chat-stream-reducer.test.ts
git commit -m "feat(taro): define chat chunk protocol types"
```

## Task 2: 实现事件 reducer

**Files:**
- Create: `apps/taro/src/hooks/chat-stream-reducer.ts`
- Test: `apps/taro/src/hooks/chat-stream-reducer.test.ts`

- [ ] **Step 1: 扩展 reducer 测试，覆盖 append 与 patch**

```ts
it('appends and patches a text chunk', () => {
  const started = applyChatStreamEvent(createEmptyChatState(), {
    type: 'message_started',
    eventId: 'e1',
    seq: 1,
    messageId: 'm1',
    timestamp: 1,
    role: 'assistant',
  })

  const appended = applyChatStreamEvent(started, {
    type: 'chunk_appended',
    eventId: 'e2',
    seq: 2,
    messageId: 'm1',
    timestamp: 2,
    chunk: {
      id: 'c1',
      type: 'text',
      status: 'streaming',
      order: 1,
      text: '你',
    },
  })

  const patched = applyChatStreamEvent(appended, {
    type: 'chunk_patched',
    eventId: 'e3',
    seq: 3,
    messageId: 'm1',
    timestamp: 3,
    chunkId: 'c1',
    patch: { op: 'append_text', text: '好' },
  })

  expect(patched.messages[0]?.chunks[0]).toMatchObject({
    id: 'c1',
    text: '你好',
  })
})
```

- [ ] **Step 2: 运行测试，确认 append / patch 用例失败**

Run: `pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts`
Expected: FAIL，提示 `applyChatStreamEvent` 未实现

- [ ] **Step 3: 实现 reducer 和基础状态工厂**

```ts
import type { ChatMessageData, ChatStreamEvent, MessageChunk } from '../components/chat-message/types'

export interface ChatState {
  messages: ChatMessageData[]
  seenEventIds: string[]
}

export function createEmptyChatState(): ChatState {
  return {
    messages: [],
    seenEventIds: [],
  }
}

export function applyChatStreamEvent(state: ChatState, event: ChatStreamEvent): ChatState {
  if (state.seenEventIds.includes(event.eventId)) {
    return state
  }

  const nextState: ChatState = {
    ...state,
    seenEventIds: [...state.seenEventIds, event.eventId],
  }

  switch (event.type) {
    case 'message_started':
      return {
        ...nextState,
        messages: [
          ...nextState.messages,
          {
            id: event.messageId,
            role: event.role,
            status: 'streaming',
            chunks: [],
            timestamp: event.timestamp,
            updatedAt: event.timestamp,
          },
        ],
      }
    case 'chunk_appended':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: [...message.chunks, event.chunk].sort((a, b) => a.order - b.order),
      }))
    case 'chunk_patched':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: message.chunks.map((chunk) => patchChunk(chunk, event.chunkId, event.patch)),
      }))
    case 'message_completed':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        status: 'completed',
        updatedAt: event.timestamp,
      }))
    case 'message_failed':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        status: 'failed',
        updatedAt: event.timestamp,
      }))
  }
}

function updateMessage(
  state: ChatState,
  messageId: string,
  updater: (message: ChatMessageData) => ChatMessageData
): ChatState {
  return {
    ...state,
    messages: state.messages.map((message) => (message.id === messageId ? updater(message) : message)),
  }
}

function patchChunk(
  chunk: MessageChunk,
  chunkId: string,
  patch: { op: 'append_text'; text: string } | { op: 'replace_text'; text: string } | { op: 'set_status'; status: 'streaming' | 'completed' | 'failed' }
): MessageChunk {
  if (chunk.id !== chunkId) return chunk
  if (patch.op === 'set_status') return { ...chunk, status: patch.status }
  if ((chunk.type === 'text' || chunk.type === 'markdown') && patch.op === 'append_text') {
    return { ...chunk, text: `${chunk.text}${patch.text}` }
  }
  if ((chunk.type === 'text' || chunk.type === 'markdown') && patch.op === 'replace_text') {
    return { ...chunk, text: patch.text }
  }
  return chunk
}
```

- [ ] **Step 4: 运行 reducer 测试并补重复事件用例**

Run: `pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts`
Expected: PASS

- [ ] **Step 5: 提交本任务**

```bash
git add apps/taro/src/hooks/chat-stream-reducer.ts apps/taro/src/hooks/chat-stream-reducer.test.ts
git commit -m "feat(taro): add chat stream reducer"
```

## Task 3: 新建 mock 事件工厂，替换字符串响应库

**Files:**
- Create: `apps/taro/src/hooks/chat-stream-mock.ts`
- Modify: `apps/taro/src/hooks/use-stream-chat.ts`
- Test: `apps/taro/src/chat-protocol-integration.test.tsx`

- [ ] **Step 1: 写集成测试，要求 mock 可产出图片或表单 chunk**

```ts
import { describe, expect, it } from 'vitest'
import { createMockAssistantEvents } from './hooks/chat-stream-mock'

describe('chat stream mock', () => {
  it('creates a form chunk flow for lead collection prompt', () => {
    const events = createMockAssistantEvents('请帮我收集联系方式')
    expect(events.some((event) => event.type === 'chunk_appended' && event.chunk.type === 'form')).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试，确认 mock 工厂不存在而失败**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx`
Expected: FAIL，提示 `chat-stream-mock.ts` 尚不存在

- [ ] **Step 3: 实现结构化 mock 事件工厂**

```ts
import type { ChatStreamEvent } from '../components/chat-message/types'

export function createMockAssistantEvents(prompt: string): ChatStreamEvent[] {
  if (prompt.includes('联系方式')) {
    return [
      {
        type: 'message_started',
        eventId: 'evt-form-1',
        seq: 1,
        messageId: 'assistant-form-1',
        timestamp: Date.now(),
        role: 'assistant',
      },
      {
        type: 'chunk_appended',
        eventId: 'evt-form-2',
        seq: 2,
        messageId: 'assistant-form-1',
        timestamp: Date.now(),
        chunk: {
          id: 'chunk-form-text',
          type: 'text',
          status: 'completed',
          order: 1,
          text: '请先填写以下信息：',
        },
      },
      {
        type: 'chunk_appended',
        eventId: 'evt-form-3',
        seq: 3,
        messageId: 'assistant-form-1',
        timestamp: Date.now(),
        chunk: {
          id: 'chunk-form-schema',
          type: 'form',
          status: 'completed',
          order: 2,
          formId: 'contact-form',
          title: '联系信息',
          submitLabel: '提交',
          fields: [
            { name: 'name', label: '姓名', fieldType: 'text', required: true, placeholder: '请输入姓名' },
            { name: 'phone', label: '手机号', fieldType: 'text', required: true, placeholder: '请输入手机号' },
          ],
        },
      },
      {
        type: 'message_completed',
        eventId: 'evt-form-4',
        seq: 4,
        messageId: 'assistant-form-1',
        timestamp: Date.now(),
      },
    ]
  }

  return [
    {
      type: 'message_started',
      eventId: 'evt-text-1',
      seq: 1,
      messageId: 'assistant-text-1',
      timestamp: Date.now(),
      role: 'assistant',
    },
    {
      type: 'chunk_appended',
      eventId: 'evt-text-2',
      seq: 2,
      messageId: 'assistant-text-1',
      timestamp: Date.now(),
      chunk: {
        id: 'chunk-text-1',
        type: 'text',
        status: 'streaming',
        order: 1,
        text: '',
      },
    },
    {
      type: 'chunk_patched',
      eventId: 'evt-text-3',
      seq: 3,
      messageId: 'assistant-text-1',
      timestamp: Date.now(),
      chunkId: 'chunk-text-1',
      patch: { op: 'replace_text', text: '这是默认的文本响应。' },
    },
    {
      type: 'message_completed',
      eventId: 'evt-text-4',
      seq: 4,
      messageId: 'assistant-text-1',
      timestamp: Date.now(),
    },
  ]
}
```

- [ ] **Step 4: 在 `use-stream-chat.ts` 中改为消费事件工厂**

```ts
import { applyChatStreamEvent, createEmptyChatState } from './chat-stream-reducer'
import { createMockAssistantEvents } from './chat-stream-mock'

const [state, setState] = useState(createEmptyChatState())

const sendMessage = useCallback((content: string) => {
  const trimmed = content.trim()
  if (!trimmed || isStreaming) return

  const userMessageId = generateId()
  setState((prev) =>
    applyChatStreamEvent(
      {
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: userMessageId,
            role: 'user',
            status: 'completed',
            chunks: [
              {
                id: `${userMessageId}-text`,
                type: 'text',
                status: 'completed',
                order: 1,
                text: trimmed,
              },
            ],
            timestamp: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
      createMockAssistantEvents(trimmed)[0]!
    )
  )
}, [isStreaming])
```

注：实现时不要真的只消费第一个事件；要把 `createMockAssistantEvents(trimmed)` 返回的事件队列逐个回放。

- [ ] **Step 5: 运行新的 mock 测试**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx`
Expected: PASS

- [ ] **Step 6: 提交本任务**

```bash
git add apps/taro/src/hooks/chat-stream-mock.ts apps/taro/src/hooks/use-stream-chat.ts apps/taro/src/chat-protocol-integration.test.tsx
git commit -m "feat(taro): add structured chat mock events"
```

## Task 4: 实现 chunk renderer

**Files:**
- Create: `apps/taro/src/components/chat-message/renderers.tsx`
- Modify: `apps/taro/src/components/chat-message/index.tsx`
- Modify: `apps/taro/src/components/chat-message/index.scss`
- Test: `apps/taro/src/components/chat-message/renderers.test.tsx`

- [ ] **Step 1: 写渲染测试，覆盖 text、image、form**

```ts
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChatChunkRenderer } from './renderers'

describe('ChatChunkRenderer', () => {
  it('renders text chunks', () => {
    const html = renderToString(
      <ChatChunkRenderer chunk={{ id: 'c1', type: 'text', status: 'completed', order: 1, text: '你好' }} />
    )
    expect(html).toContain('你好')
  })
})
```

- [ ] **Step 2: 运行测试，确认渲染器未实现而失败**

Run: `pnpm test apps/taro/src/components/chat-message/renderers.test.tsx`
Expected: FAIL，提示 `renderers.tsx` 尚不存在

- [ ] **Step 3: 实现渲染器分发**

```tsx
import { Image, Text, View } from '@tarojs/components'
import type { MessageChunk } from './types'

export function ChatChunkRenderer({ chunk }: { chunk: MessageChunk }) {
  switch (chunk.type) {
    case 'text':
      return <Text className="chat-message__text">{chunk.text}</Text>
    case 'markdown':
      return <Text className="chat-message__markdown">{chunk.text}</Text>
    case 'image':
      return <Image className="chat-message__image" src={chunk.url} mode="widthFix" />
    case 'form':
      return (
        <View className="chat-message__form">
          {chunk.title ? <Text className="chat-message__form-title">{chunk.title}</Text> : null}
          {chunk.fields.map((field) => (
            <View key={field.name} className="chat-message__form-field">
              <Text className="chat-message__form-label">{field.label}</Text>
              <Text className="chat-message__form-placeholder">{field.placeholder ?? ''}</Text>
            </View>
          ))}
          <Text className="chat-message__form-submit">{chunk.submitLabel ?? '提交'}</Text>
        </View>
      )
  }
}
```

- [ ] **Step 4: 在 `ChatMessage` 中改为遍历 `message.chunks`**

```tsx
<View className="chat-message__bubble">
  {message.chunks.map((chunk) => (
    <View key={chunk.id} className={`chat-message__chunk chat-message__chunk--${chunk.type}`}>
      <ChatChunkRenderer chunk={chunk} />
    </View>
  ))}
  {isTyping && <Text className="chat-message__cursor">▋</Text>}
</View>
```

- [ ] **Step 5: 补样式并运行渲染测试**

Run: `pnpm test apps/taro/src/components/chat-message/renderers.test.tsx`
Expected: PASS

- [ ] **Step 6: 提交本任务**

```bash
git add apps/taro/src/components/chat-message/renderers.tsx apps/taro/src/components/chat-message/index.tsx apps/taro/src/components/chat-message/index.scss apps/taro/src/components/chat-message/renderers.test.tsx
git commit -m "feat(taro): render chat chunks by type"
```

## Task 5: 把 hook 的流式逻辑改成事件回放

**Files:**
- Modify: `apps/taro/src/hooks/use-stream-chat.ts`
- Test: `apps/taro/src/chat-protocol-integration.test.tsx`

- [ ] **Step 1: 写集成测试，要求文本 chunk 通过事件逐步更新**

```ts
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useStreamChat } from './hooks/use-stream-chat'

describe('useStreamChat', () => {
  it('streams assistant text through chunk patch events', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useStreamChat({ charDelay: 10 }))

    act(() => {
      result.current.sendMessage('什么是人工智能？')
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    const assistant = result.current.messages.find((message) => message.role === 'assistant')
    expect(assistant?.chunks[0]).toMatchObject({ type: 'text' })
    expect(assistant?.chunks[0] && 'text' in assistant.chunks[0] ? assistant.chunks[0].text.length : 0).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 运行测试，确认 hook 尚未按事件流工作**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx`
Expected: FAIL

- [ ] **Step 3: 把字符串切片改成事件队列回放**

```ts
const [state, setState] = useState(createEmptyChatState())
const messages = state.messages

const playbackEvents = useCallback((events: ChatStreamEvent[]) => {
  let index = 0
  setIsStreaming(true)

  timerRef.current = setInterval(() => {
    const event = events[index]
    if (!event) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsStreaming(false)
      return
    }

    setState((prev) => applyChatStreamEvent(prev, event))
    index += 1
  }, charDelay)
}, [charDelay])
```

- [ ] **Step 4: 确保 `clearMessages` 可中断事件回放**

```ts
const clearMessages = useCallback(() => {
  if (timerRef.current) {
    clearInterval(timerRef.current)
    timerRef.current = null
  }
  setIsStreaming(false)
  setState(createEmptyChatState())
}, [])
```

- [ ] **Step 5: 运行 hook 集成测试**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx`
Expected: PASS

- [ ] **Step 6: 提交本任务**

```bash
git add apps/taro/src/hooks/use-stream-chat.ts apps/taro/src/chat-protocol-integration.test.tsx
git commit -m "feat(taro): replay chat stream events"
```

## Task 6: 调整聊天页接入新消息模型

**Files:**
- Modify: `apps/taro/src/pages/chat/index.tsx`
- Test: `apps/taro/src/chat-protocol-integration.test.tsx`

- [ ] **Step 1: 写页面集成断言，确保页面仍能发送和显示消息**

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('chat page protocol wiring', () => {
  it('keeps ChatMessage rendering and useStreamChat wiring', () => {
    const file = readFileSync(resolve(process.cwd(), 'apps/taro/src/pages/chat/index.tsx'), 'utf8')
    expect(file).toContain('useStreamChat')
    expect(file).toContain('<ChatMessage')
  })
})
```

- [ ] **Step 2: 运行页面接线测试**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx`
Expected: PASS 或新增断言后先 FAIL，再据实际修改修正

- [ ] **Step 3: 更新 `chat/index.tsx` 仅消费新消息结构，不再依赖 `message.content`**

```tsx
{messages.map((msg, idx) => (
  <View key={msg.id} id={`msg-${idx}`}>
    <ChatMessage
      message={msg}
      isTyping={isStreaming && idx === messages.length - 1 && msg.role === 'assistant' && msg.status === 'streaming'}
    />
  </View>
))}
```

- [ ] **Step 4: 运行聊天相关测试**

Run: `pnpm test apps/taro/src/chat-protocol-integration.test.tsx apps/taro/src/taroify-migration.test.ts`
Expected: PASS

- [ ] **Step 5: 提交本任务**

```bash
git add apps/taro/src/pages/chat/index.tsx apps/taro/src/chat-protocol-integration.test.tsx apps/taro/src/taroify-migration.test.ts
git commit -m "feat(taro): wire chat page to chunk protocol"
```

## Task 7: 完成总体验证

**Files:**
- Modify: `apps/taro/src/taroify-migration.test.ts`
- Test: `apps/taro/src/hooks/chat-stream-reducer.test.ts`
- Test: `apps/taro/src/components/chat-message/renderers.test.tsx`
- Test: `apps/taro/src/chat-protocol-integration.test.tsx`

- [ ] **Step 1: 运行 reducer、renderer、集成测试**

Run: `pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts apps/taro/src/components/chat-message/renderers.test.tsx apps/taro/src/chat-protocol-integration.test.tsx`
Expected: PASS

- [ ] **Step 2: 运行 Taro 应用类型检查**

Run: `pnpm --filter @repo/taro type-check`
Expected: PASS

- [ ] **Step 3: 运行与 Taro H5 入口相关的回归测试**

Run: `pnpm test apps/taro/src/react-dom-compat.test.ts apps/taro/src/react-version-resolution.test.ts apps/taro/src/index-html-entry.test.ts apps/taro/src/taroify-migration.test.ts`
Expected: PASS

- [ ] **Step 4: 手工验证 H5 页面**

Run: `pnpm dev:taro:h5`
Expected: 本地启动成功，访问 `http://localhost:10086/#/pages/chat/index`

手工检查：

- 发送普通问题时，AI 文本以 chunk 方式流式显示
- 发送图片类提示词时，消息中可见图片块
- 发送表单类提示词时，消息中可见表单块
- 页面没有运行时报错和白屏

- [ ] **Step 5: 提交验证完成后的最终代码**

```bash
git add apps/taro/src/components/chat-message apps/taro/src/hooks apps/taro/src/pages/chat/index.tsx apps/taro/src/*.test.ts*
git commit -m "feat(taro): support chunk-based streaming chat messages"
```

## 规格覆盖检查

- 规格要求的块级消息模型：由 Task 1 完成
- 规格要求的消息 / chunk 事件流：由 Task 2 和 Task 3 完成
- 规格要求的 `text`、`markdown`、`image`、`form`：由 Task 4 完成
- 规格要求的事件回放式流式输出：由 Task 5 完成
- 规格要求的聊天页接入：由 Task 6 完成
- 规格要求的测试与回归验证：由 Task 7 完成

未纳入本计划的内容：

- `card` 与 `status` 的完整 UI 曝光
- 向方案 3 的操作级协议真正落地

这两项被有意留在后续阶段，不属于本轮最小可用落地范围。

## 自检

- 已覆盖 spec 中的核心要求，没有留 `TODO` / `TBD`
- 任务顺序遵循 TDD：先测试，后实现，再验证
- 关键类型名和事件名在各任务中保持一致：
  - `ChatMessageData`
  - `MessageChunk`
  - `ChatStreamEvent`
  - `applyChatStreamEvent`
  - `createMockAssistantEvents`


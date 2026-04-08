# Taro Chat A2UI-Friendly Message Protocol Design

## Context

Current Taro chat mock uses a text-only message model:

- Message payload is a single `content: string`
- Streaming is implemented by progressively slicing that string
- Renderer only supports plain text in a single message bubble

This is sufficient for demo text streaming, but it cannot represent or stream:

- images
- markdown/rich text
- forms
- cards and tool results
- structured status updates

The goal of this design is to define a protocol that is practical for the current Taro chat page while preserving a clean migration path toward an A2UI-style operation-based protocol later.

## Goals

- Replace the text-only message model with a block/chunk-based message model
- Support incremental streaming for text and structured content
- Keep the rendering model declarative and component-safe
- Keep the protocol front-end friendly for Taro/H5 rendering
- Make the protocol evolvable toward a future operation-based model similar to A2UI

## Non-Goals

- Implement a full generic UI runtime in this phase
- Support arbitrary executable UI code or raw HTML injection
- Fully adopt the upstream A2UI protocol in this phase
- Model all possible UI components on day one

## Decision

Use scheme 2: block-level incremental streaming.

The protocol remains message-oriented, but each message contains ordered chunks. Streaming events target the message and its chunks rather than only appending text to a single string. This keeps the current chat architecture intact while introducing the right structural primitives for future evolution.

## Why Scheme 2

### Recommended approach

Scheme 2 is the best fit for the current codebase because:

- it extends the existing `messages[]` mental model instead of replacing it
- it supports structured content without requiring a general UI tree engine
- it is sufficient for text, markdown, image, form, and card-like experiences
- it can later evolve into operation-based updates by preserving stable identifiers and patch semantics now

### Alternatives considered

#### Scheme 1: message-level text patching only

Pros:

- smallest implementation change
- easiest to retrofit into current mock

Cons:

- remains text-centric
- images/forms/cards still need out-of-band hacks
- migration to A2UI would require a larger redesign later

#### Scheme 3: operation-based UI protocol now

Pros:

- closest to a future A2UI-style model
- strongest long-term flexibility

Cons:

- introduces UI tree management, operation replay, patch validation, and renderer runtime concerns immediately
- much heavier than current Taro chat needs
- delays practical support for common chat blocks

## Design Principles

- Declarative only: protocol describes what to render, not how to execute code
- Stable identity: messages and chunks must have stable ids
- Incremental updates: streaming events can append or patch chunks
- Component whitelist: front end maps protocol chunk types to trusted local components
- Compatibility first: protocol should work in Taro H5 first, then remain portable to other Taro targets
- A2UI-friendly evolution: preserve concepts that map cleanly to future node and operation models

## Data Model

### Message

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

### Chunk

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

## Streaming Event Model

Phase 1 uses a message-and-chunk event stream instead of direct UI operations.

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

## Event Semantics

### Ordering

- events are applied in ascending `seq`
- each `messageId` has its own ordered event stream
- the client must ignore duplicated events with the same `eventId`

### Message lifecycle

1. `message_started`
2. one or more `chunk_appended`
3. optional `chunk_patched`
4. `message_completed` or `message_failed`

### Chunk lifecycle

- `chunk_appended` introduces a new chunk into the target message
- `chunk_patched` updates an existing chunk by `chunkId`
- only protocol-supported patch operations are allowed
- the client must reject patches for unknown chunk ids

## Rendering Contract

The front end should not execute arbitrary payloads. It should render a trusted mapping:

- `text` -> plain text renderer
- `markdown` -> markdown renderer constrained to a safe supported subset
- `image` -> image component
- `form` -> local trusted form renderer
- `card` -> local trusted card renderer
- `status` -> inline status component

This contract matters for compatibility and security. The protocol describes data; the client owns the components.

## First-Phase Supported Chunks

For the Taro app, phase 1 should implement these first:

- `text`
- `markdown`
- `image`
- `form`

`card` and `status` should be defined in the protocol now so the shape is stable, even if the first implementation does not fully expose them in the UI.

## Example Payloads

### Example 1: plain text streaming

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

### Example 2: text plus image

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

### Example 3: text plus form

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

## Client State Model

The client state remains message-based:

```ts
interface ChatState {
  messages: ChatMessage[]
}
```

The reducer behavior should be:

- `message_started`: create message shell
- `chunk_appended`: append ordered chunk
- `chunk_patched`: patch target chunk
- `message_completed`: set message status to `completed`
- `message_failed`: set message status to `failed`

This is intentionally smaller than a generic UI tree runtime.

## Error Handling

- unknown event type: ignore and log
- duplicated `eventId`: ignore
- out-of-order `seq`: buffer or reject according to implementation complexity; initial phase may reject and log
- unknown `chunkId` in patch event: reject and log
- unsupported chunk type: render fallback placeholder and preserve raw payload in metadata for inspection

## Compatibility Constraints

To preserve Taro compatibility and future portability:

- avoid raw HTML payloads
- markdown support should be limited to a safe, supported subset
- forms should use schema-driven local components rather than server-driven executable behavior
- chunk props should remain serializable JSON only
- renderer decisions must stay in client code, not in remote payload code

## Security Constraints

- do not accept executable JavaScript in payloads
- do not support arbitrary HTML rendering in phase 1
- all actions must resolve to trusted local handlers
- all remote URLs, especially images, should go through existing app security policy if one exists

## Mapping Toward Scheme 3

Scheme 2 should preserve these compatibility anchors now:

- every message has stable `messageId`
- every chunk has stable `chunkId`
- every event has stable `eventId` and monotonic `seq`
- patch semantics are explicit, not implicit string replacement

These anchors make the upgrade path cleaner:

### Scheme 2 concept -> Scheme 3 concept

- `message` -> UI subtree root or logical container node
- `chunk` -> typed UI node
- `chunk_appended` -> `append_node`
- `chunk_patched` -> `patch_props`
- `message_completed` -> terminal lifecycle event

## Evolution Plan: Scheme 2 to Scheme 3

### Phase A: block protocol rollout

- migrate current `content: string` messages to `chunks[]`
- add chunk renderer for text, markdown, image, and form
- implement event reducer for message/chunk events
- keep streaming scoped to the chat message domain

### Phase B: richer chunk semantics

- add `card` and `status`
- add action payload conventions for buttons and form submission
- add local interaction events such as `form_submitted` and `action_clicked`

### Phase C: internal node abstraction

- introduce a normalized renderer node shape behind chunks
- keep public protocol still message/chunk-based
- adapt each chunk type to one or more internal renderer nodes

### Phase D: operation-based event layer

- add optional operation events such as `append_node`, `patch_props`, and `remove_node`
- allow selected messages to opt into operation-based updates
- preserve backward compatibility by translating chunk events into node operations internally

### Phase E: A2UI alignment

- align node schema naming and prop conventions with the chosen A2UI version
- add renderer adapter layer that maps protocol nodes to local Taro/Taroify components
- decide which message-domain abstractions remain product-specific and which should become A2UI-native

## Recommended Implementation Order

1. Replace message `content` with `chunks`
2. Implement `text` and `markdown` chunks
3. Implement `image` chunk
4. Implement `form` chunk
5. Refactor mock stream from string slicing to event playback
6. Add reducer tests for event ordering and patch application
7. Add a protocol adapter layer so current mock data and future backend payloads use the same reducer entrypoint

## Testing Strategy

- reducer unit tests for every event type
- duplicate and unknown event handling tests
- chunk renderer tests for each supported chunk type
- integration tests for text streaming, image display, and form display
- backward-compatibility tests to ensure old mock inputs can be adapted during migration

## Open Decisions Resolved In This Spec

- protocol layer to design now: front-end plus front-end/back-end streaming contract
- selected scheme: scheme 2
- migration posture: A2UI-friendly, not A2UI-native yet
- initial supported content: text, markdown, image, form

## Summary

This design intentionally avoids the two bad extremes:

- staying with a text-only protocol that blocks structured content
- overbuilding a full operation-based UI runtime before current product needs justify it

Scheme 2 is the correct midpoint. It is practical for the current Taro chat product and structurally compatible with a later scheme-3 evolution toward an A2UI-style renderer and operation model.

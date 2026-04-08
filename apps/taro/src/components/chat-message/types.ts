// 聊天消息组件类型定义

export const MessageRole = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
  TOOL: 'tool',
} as const

export type MessageRoleType = typeof MessageRole[keyof typeof MessageRole]

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

export interface ChatMessageData {
  id: string
  role: MessageRoleType
  status: MessageStatus
  chunks: MessageChunk[]
  timestamp: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

export interface ChatMessageProps {
  /** 消息内容 */
  message: ChatMessageData
  /** 是否正在输入（流式输出时） */
  isTyping?: boolean
  /** 自定义类名 */
  className?: string
}

export type ChatChunkPatch =
  | { op: 'append_text'; text: string }
  | { op: 'replace_text'; text: string }
  | { op: 'set_status'; status: ChunkStatus }
  | { op: 'merge_metadata'; metadata: Record<string, unknown> }

export interface EventBase {
  eventId: string
  seq: number
  messageId: string
  timestamp: number
}

export interface MessageStartedEvent extends EventBase {
  type: 'message_started'
  role: MessageRoleType
  metadata?: Record<string, unknown>
}

export interface ChunkAppendedEvent extends EventBase {
  type: 'chunk_appended'
  chunk: MessageChunk
}

export interface ChunkPatchedEvent extends EventBase {
  type: 'chunk_patched'
  chunkId: string
  patch: ChatChunkPatch
}

export interface MessageCompletedEvent extends EventBase {
  type: 'message_completed'
}

export interface MessageFailedEvent extends EventBase {
  type: 'message_failed'
  errorCode: string
  errorMessage: string
}

export type ChatStreamEvent =
  | MessageStartedEvent
  | ChunkAppendedEvent
  | ChunkPatchedEvent
  | MessageCompletedEvent
  | MessageFailedEvent

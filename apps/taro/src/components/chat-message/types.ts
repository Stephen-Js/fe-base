// 聊天消息组件类型定义

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const

export type MessageRoleType = typeof MessageRole[keyof typeof MessageRole]

export interface ChatMessageData {
  id: string
  role: MessageRoleType
  content: string
  timestamp: number
}

export interface ChatMessageProps {
  /** 消息内容 */
  message: ChatMessageData
  /** 是否正在输入（流式输出时） */
  isTyping?: boolean
  /** 自定义类名 */
  className?: string
}

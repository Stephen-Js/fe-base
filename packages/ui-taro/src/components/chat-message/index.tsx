// 聊天消息组件
import { View, Text } from '@tarojs/components'
import { ChatMessageProps } from './types'
import './index.scss'

export function ChatMessage({ message, isTyping = false, className = '' }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <View className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'} ${className}`}>
      {/* 头像 */}
      <View className={`chat-message__avatar ${isUser ? 'user' : 'assistant'}`}>
        <Text className="chat-message__avatar-icon">
          {isUser ? '👤' : '🤖'}
        </Text>
      </View>

      {/* 消息内容 */}
      <View className="chat-message__bubble">
        <Text className="chat-message__text">{message.content}</Text>
        {isTyping && (
          <Text className="chat-message__cursor">▋</Text>
        )}
      </View>

      {/* 时间戳 */}
      <Text className="chat-message__time">
        {formatTime(message.timestamp)}
      </Text>
    </View>
  )
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export type { ChatMessageProps, ChatMessageData, MessageRole } from './types'

// 流式对话 Hook
import { useState, useCallback, useRef } from 'react'
import type { ChatMessageData } from '../components/chat-message/types'
import { applyChatStreamEvent, createEmptyChatState, type ChatState } from './chat-stream-reducer'
import { createMockAssistantEvents } from './chat-stream-mock'

interface UseStreamChatOptions {
  /** 流式输出每个字符的延迟（毫秒） */
  charDelay?: number
}

interface UseStreamChatReturn {
  /** 消息列表 */
  messages: ChatMessageData[]
  /** 是否正在流式输出 */
  isStreaming: boolean
  /** 发送消息 */
  sendMessage: (content: string) => void
  /** 清空消息 */
  clearMessages: () => void
}

export function useStreamChat(options: UseStreamChatOptions = {}): UseStreamChatReturn {
  const { charDelay = 50 } = options
  const [state, setState] = useState<ChatState>(() => createEmptyChatState())
  const [isStreaming, setIsStreaming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const messageIdRef = useRef(0)
  const messages: ChatMessageData[] = state.messages

  const generateId = useCallback(() => {
    messageIdRef.current += 1
    return `msg-${Date.now()}-${messageIdRef.current}`
  }, [])

  const createEventIdGenerator = useCallback((prefix: string) => {
    let eventCounter = 0
    return () => {
      eventCounter += 1
      return `${prefix}-event-${eventCounter}`
    }
  }, [])

  const playbackEvents = useCallback((events: ReturnType<typeof createMockAssistantEvents>) => {
    let eventIndex = 0
    setIsStreaming(true)

    timerRef.current = setInterval(() => {
      const nextEvent = events[eventIndex]

      if (!nextEvent) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsStreaming(false)
        return
      }

      setState((prev) => applyChatStreamEvent(prev, nextEvent))
      eventIndex += 1
    }, charDelay)
  }, [charDelay])

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isStreaming) return

    const userMessageId = generateId()
    const now = Date.now()
    const userMessage: ChatMessageData = {
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
      timestamp: now,
      updatedAt: now,
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }))

    const assistantMessageId = generateId()
    const events = createMockAssistantEvents(trimmed, {
      messageId: assistantMessageId,
      nextEventId: createEventIdGenerator(assistantMessageId),
      baseTimestamp: now,
    })

    playbackEvents(events)
  }, [createEventIdGenerator, generateId, isStreaming, playbackEvents])

  // 清空消息
  const clearMessages = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsStreaming(false)
    setState(createEmptyChatState())
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  }
}

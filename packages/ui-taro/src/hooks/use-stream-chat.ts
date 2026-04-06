// 流式对话 Hook
import { useState, useCallback, useRef } from 'react'
import { ChatMessageData, MessageRole } from '../components/chat-message/types'

// Mock AI 响应库
const MOCK_AI_RESPONSES: Record<string, string> = {
  '今天天气怎么样？': '抱歉，作为 Mock 服务，我暂时无法获取实时天气信息。建议您查看手机自带的天气应用获取准确的天气预报。不过可以告诉您，希望今天是个好天气！ ☀️',
  '帮我写一首诗': `春风轻拂柳絮飞，
燕子归来筑新泥。
桃花绽放满枝头，
一派生机醉人迷。

这是一首关于春天的七言绝句，希望您喜欢！ 🌸`,
  '什么是人工智能？': `人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个重要分支，致力于创建能够执行通常需要人类智能的任务的系统。

主要应用领域包括：
• 自然语言处理
• 计算机视觉
• 机器学习
• 专家系统

我是基于大语言模型的 AI 助手，很高兴为您服务！ 🤖`,
  '给我讲个笑话': `程序员去面试，面试官问："你有什么特长？"
程序员说："我能在有网络的地方生存。"
面试官："那没网络呢？"
程序员："那...那我可能会死机。"

😄 希望这个小笑话能让您开心一下！`,
  '如何学习编程？': `学习编程的建议路径：

1. **选择入门语言**
   - Python：语法简洁，适合初学者
   - JavaScript：前端开发必备

2. **掌握基础概念**
   - 变量、数据类型
   - 条件语句、循环
   - 函数、对象

3. **实践项目**
   - 从小项目开始
   - 参与开源项目

4. **持续学习**
   - 阅读优秀代码
   - 关注技术社区

加油！编程是一段有趣的旅程！ 💻`,
}

// 默认响应
const DEFAULT_RESPONSE = `感谢您的提问！作为 Mock 服务，我暂时只能回答预设的问题。

您可以尝试问我：
• 今天天气怎么样？
• 帮我写一首诗
• 什么是人工智能？
• 给我讲个笑话
• 如何学习编程？

期待与您的更多交流！ 😊`

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
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messageIdRef = useRef(0)

  // 发送消息
  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || isStreaming) return

    // 生成消息 ID
    const generateId = () => {
      messageIdRef.current += 1
      return `msg-${Date.now()}-${messageIdRef.current}`
    }

    // 添加用户消息
    const userMessage: ChatMessageData = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])

    // 获取 AI 响应
    const aiResponse = MOCK_AI_RESPONSES[content.trim()] ?? DEFAULT_RESPONSE

    // 创建 AI 消息占位
    const aiMessageId = generateId()
    const aiMessage: ChatMessageData = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, aiMessage])

    // 模拟流式输出
    setIsStreaming(true)
    let charIndex = 0

    timerRef.current = setInterval(() => {
      if (charIndex < aiResponse.length) {
        const partialContent = aiResponse.slice(0, charIndex + 1)
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: partialContent }
              : msg
          )
        )
        charIndex++
      } else {
        // 输出完成
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsStreaming(false)
      }
    }, charDelay)
  }, [charDelay, isStreaming])

  // 清空消息
  const clearMessages = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsStreaming(false)
    setMessages([])
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    clearMessages,
  }
}

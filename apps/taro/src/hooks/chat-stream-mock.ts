import type {
  ChatStreamEvent,
  ChunkStatus,
  MessageChunk,
  MessageRoleType,
} from '../components/chat-message/types'

interface MockEventOptions {
  messageId: string
  nextEventId: () => string
  baseTimestamp?: number
}

const DEFAULT_TEXT_RESPONSE = `感谢您的提问！作为 Mock 服务，我暂时只能回答预设的问题。

您可以尝试问我：
• 今天天气怎么样？
• 帮我写一首诗
• 什么是人工智能？
• 给我讲个笑话
• 如何学习编程？
• 给我一张春天的配图
• 请帮我收集联系方式

期待与您的更多交流！ 😊`

const TEXT_RESPONSES: Record<string, string> = {
  '今天天气怎么样？': '抱歉，作为 Mock 服务，我暂时无法获取实时天气信息。建议您查看手机自带的天气应用获取准确的天气预报。不过可以告诉您，希望今天是个好天气！ ☀️',
  '帮我写一首诗': `春风轻拂柳絮飞，
燕子归来筑新泥。
桃花绽放满枝头，
一派生机醉人迷。

这是一首关于春天的七言绝句，希望您喜欢！ 🌸`,
  '什么是人工智能？': `人工智能（Artificial Intelligence，简称 AI）是计算机科学的重要分支，目标是让系统具备感知、理解、推理和生成能力。

常见应用包括：
• 自然语言处理
• 计算机视觉
• 机器学习
• 智能决策

我是一个基于大语言模型的 Mock 助手，目前通过结构化消息协议来展示回答。`,
  '给我讲个笑话': `程序员去面试，面试官问：“你有什么特长？”
程序员说：“我能在有网络的地方生存。”
面试官问：“那没网络呢？”
程序员说：“那我可能会死机。” 😄`,
  '如何学习编程？': `学习编程可以按这个顺序开始：

1. 先选一门入门语言，比如 Python 或 JavaScript
2. 理解变量、条件、循环、函数这些基础概念
3. 从小项目开始练习，不要只看教程
4. 逐步阅读优秀代码并持续迭代

关键不在于学得多快，而在于能持续写、持续改。`,
}

const IMAGE_URL = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=80'

function createEventBase(options: MockEventOptions, seq: number, messageId: string) {
  return {
    eventId: options.nextEventId(),
    seq,
    messageId,
    timestamp: (options.baseTimestamp ?? Date.now()) + seq,
  }
}

function createMessageStartedEvent(
  options: MockEventOptions,
  seq: number,
  role: MessageRoleType = 'assistant'
): ChatStreamEvent {
  return {
    type: 'message_started',
    ...createEventBase(options, seq, options.messageId),
    role,
  }
}

function createChunkAppendedEvent(
  options: MockEventOptions,
  seq: number,
  chunk: MessageChunk
): ChatStreamEvent {
  return {
    type: 'chunk_appended',
    ...createEventBase(options, seq, options.messageId),
    chunk,
  }
}

function createChunkPatchedEvent(
  options: MockEventOptions,
  seq: number,
  chunkId: string,
  text: string
): ChatStreamEvent {
  return {
    type: 'chunk_patched',
    ...createEventBase(options, seq, options.messageId),
    chunkId,
    patch: {
      op: 'append_text',
      text,
    },
  }
}

function createChunkStatusPatchedEvent(
  options: MockEventOptions,
  seq: number,
  chunkId: string,
  status: ChunkStatus
): ChatStreamEvent {
  return {
    type: 'chunk_patched',
    ...createEventBase(options, seq, options.messageId),
    chunkId,
    patch: {
      op: 'set_status',
      status,
    },
  }
}

function createMessageCompletedEvent(options: MockEventOptions, seq: number): ChatStreamEvent {
  return {
    type: 'message_completed',
    ...createEventBase(options, seq, options.messageId),
  }
}

export function createMockAssistantEvents(prompt: string, options: MockEventOptions): ChatStreamEvent[] {
  const normalizedPrompt = prompt.trim()

  if (normalizedPrompt.includes('配图') || normalizedPrompt.includes('图片')) {
    return [
      createMessageStartedEvent(options, 1),
      createChunkAppendedEvent(options, 2, {
        id: `${options.messageId}-md`,
        type: 'markdown',
        status: 'completed',
        order: 1,
        text: '下面是一张适合当前话题的配图：',
      }),
      createChunkAppendedEvent(options, 3, {
        id: `${options.messageId}-image`,
        type: 'image',
        status: 'completed',
        order: 2,
        url: IMAGE_URL,
        alt: '春天主题配图',
      }),
      createMessageCompletedEvent(options, 4),
    ]
  }

  if (normalizedPrompt.includes('联系方式') || normalizedPrompt.includes('表单')) {
    return [
      createMessageStartedEvent(options, 1),
      createChunkAppendedEvent(options, 2, {
        id: `${options.messageId}-text`,
        type: 'text',
        status: 'completed',
        order: 1,
        text: '请先填写以下联系信息：',
      }),
      createChunkAppendedEvent(options, 3, {
        id: `${options.messageId}-form`,
        type: 'form',
        status: 'completed',
        order: 2,
        formId: 'contact-form',
        title: '联系信息',
        submitLabel: '提交',
        fields: [
          {
            name: 'name',
            label: '姓名',
            fieldType: 'text',
            required: true,
            placeholder: '请输入姓名',
          },
          {
            name: 'phone',
            label: '手机号',
            fieldType: 'text',
            required: true,
            placeholder: '请输入手机号',
          },
          {
            name: 'note',
            label: '备注',
            fieldType: 'textarea',
            placeholder: '请输入补充说明',
          },
        ],
      }),
      createMessageCompletedEvent(options, 4),
    ]
  }

  const responseText = TEXT_RESPONSES[normalizedPrompt] ?? DEFAULT_TEXT_RESPONSE
  const textChunkId = `${options.messageId}-text`
  const events: ChatStreamEvent[] = [
    createMessageStartedEvent(options, 1),
    createChunkAppendedEvent(options, 2, {
      id: textChunkId,
      type: 'text',
      status: 'streaming',
      order: 1,
      text: '',
    }),
  ]

  let seq = 3
  for (const char of responseText) {
    events.push(createChunkPatchedEvent(options, seq, textChunkId, char))
    seq += 1
  }

  events.push(createChunkStatusPatchedEvent(options, seq, textChunkId, 'completed'))
  events.push(createMessageCompletedEvent(options, seq + 1))

  return events
}

import { describe, expect, it } from 'vitest'
import { createMockAssistantEvents } from './hooks/chat-stream-mock'

describe('chat protocol mock integration', () => {
  it('creates a form chunk flow for lead collection prompts', () => {
    const events = createMockAssistantEvents('请帮我收集联系方式', {
      messageId: 'm1',
      nextEventId: () => 'evt-1',
      baseTimestamp: 1,
    })

    expect(events.some((event) => event.type === 'chunk_appended' && event.chunk.type === 'form')).toBe(true)
  })

  it('creates an image chunk flow for image prompts', () => {
    const events = createMockAssistantEvents('给我一张春天的配图', {
      messageId: 'm2',
      nextEventId: () => 'evt-2',
      baseTimestamp: 1,
    })

    expect(events.some((event) => event.type === 'chunk_appended' && event.chunk.type === 'image')).toBe(true)
  })

  it('creates patch events for text streaming', () => {
    const events = createMockAssistantEvents('什么是人工智能？', {
      messageId: 'm3',
      nextEventId: (() => {
        let value = 0
        return () => `evt-${++value}`
      })(),
      baseTimestamp: 1,
    })

    expect(events[0]?.type).toBe('message_started')
    expect(events[1]?.type).toBe('chunk_appended')
    expect(events.some((event) => event.type === 'chunk_patched')).toBe(true)
    expect(events.at(-1)?.type).toBe('message_completed')
  })
})

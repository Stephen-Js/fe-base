import { describe, expect, it } from 'vitest'
import { applyChatStreamEvent, createEmptyChatState } from './chat-stream-reducer'
import type { ChatStreamEvent } from '../components/chat-message/types'

describe('chat stream reducer', () => {
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

  it('ignores duplicate events by eventId', () => {
    const state = createEmptyChatState()
    const event: ChatStreamEvent = {
      type: 'message_started',
      eventId: 'e1',
      seq: 1,
      messageId: 'm1',
      timestamp: 1,
      role: 'assistant',
    }

    const once = applyChatStreamEvent(state, event)
    const twice = applyChatStreamEvent(once, event)

    expect(twice.messages).toHaveLength(1)
  })
})

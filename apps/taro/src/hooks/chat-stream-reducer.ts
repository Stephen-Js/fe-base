import type {
  ChatChunkPatch,
  ChatMessageData,
  ChatStreamEvent,
  MessageChunk,
} from '../components/chat-message/types'

export interface ChatState {
  messages: ChatMessageData[]
  seenEventIds: string[]
  lastSeqByMessageId: Record<string, number>
  errors: string[]
}

export function createEmptyChatState(): ChatState {
  return {
    messages: [],
    seenEventIds: [],
    lastSeqByMessageId: {},
    errors: [],
  }
}

export function applyChatStreamEvent(state: ChatState, event: ChatStreamEvent): ChatState {
  if (state.seenEventIds.includes(event.eventId)) {
    return state
  }

  const previousSeq = state.lastSeqByMessageId[event.messageId]
  if (typeof previousSeq === 'number' && event.seq <= previousSeq) {
    return appendError(state, `Out-of-order event for message ${event.messageId}: seq ${event.seq} <= ${previousSeq}`)
  }

  const nextState: ChatState = {
    ...state,
    seenEventIds: [...state.seenEventIds, event.eventId],
    lastSeqByMessageId: {
      ...state.lastSeqByMessageId,
      [event.messageId]: event.seq,
    },
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
            metadata: event.metadata,
          },
        ],
      }
    case 'chunk_appended':
      if (!hasMessage(nextState, event.messageId)) {
        return appendError(nextState, `Cannot append chunk to unknown message ${event.messageId}`)
      }
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: [...message.chunks, event.chunk].sort((left, right) => left.order - right.order),
      }))
    case 'chunk_patched':
      if (!hasMessage(nextState, event.messageId)) {
        return appendError(nextState, `Cannot patch chunk on unknown message ${event.messageId}`)
      }
      if (!hasChunk(nextState, event.messageId, event.chunkId)) {
        return appendError(nextState, `Cannot patch unknown chunk ${event.chunkId} on message ${event.messageId}`)
      }
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: message.chunks.map((chunk) => patchChunk(chunk, event.chunkId, event.patch)),
      }))
    case 'message_completed':
      if (!hasMessage(nextState, event.messageId)) {
        return appendError(nextState, `Cannot complete unknown message ${event.messageId}`)
      }
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        status: 'completed',
        updatedAt: event.timestamp,
      }))
    case 'message_failed':
      if (!hasMessage(nextState, event.messageId)) {
        return appendError(nextState, `Cannot fail unknown message ${event.messageId}`)
      }
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        status: 'failed',
        updatedAt: event.timestamp,
        metadata: {
          ...message.metadata,
          errorCode: event.errorCode,
          errorMessage: event.errorMessage,
        },
      }))
  }
}

function appendError(state: ChatState, error: string): ChatState {
  return {
    ...state,
    errors: [...state.errors, error],
  }
}

function hasMessage(state: ChatState, messageId: string): boolean {
  return state.messages.some((message) => message.id === messageId)
}

function hasChunk(state: ChatState, messageId: string, chunkId: string): boolean {
  const message = state.messages.find((entry) => entry.id === messageId)
  return message?.chunks.some((chunk) => chunk.id === chunkId) ?? false
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

function patchChunk(chunk: MessageChunk, chunkId: string, patch: ChatChunkPatch): MessageChunk {
  if (chunk.id !== chunkId) {
    return chunk
  }

  if (patch.op === 'set_status') {
    return {
      ...chunk,
      status: patch.status,
    }
  }

  if (patch.op === 'merge_metadata') {
    return {
      ...chunk,
      metadata: {
        ...chunk.metadata,
        ...patch.metadata,
      },
    }
  }

  if (chunk.type === 'text' || chunk.type === 'markdown') {
    if (patch.op === 'append_text') {
      return {
        ...chunk,
        text: `${chunk.text}${patch.text}`,
      }
    }

    if (patch.op === 'replace_text') {
      return {
        ...chunk,
        text: patch.text,
      }
    }
  }

  return chunk
}

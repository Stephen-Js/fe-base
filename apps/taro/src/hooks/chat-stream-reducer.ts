import type {
  ChatChunkPatch,
  ChatMessageData,
  ChatStreamEvent,
  MessageChunk,
} from '../components/chat-message/types'

export interface ChatState {
  messages: ChatMessageData[]
  seenEventIds: string[]
}

export function createEmptyChatState(): ChatState {
  return {
    messages: [],
    seenEventIds: [],
  }
}

export function applyChatStreamEvent(state: ChatState, event: ChatStreamEvent): ChatState {
  if (state.seenEventIds.includes(event.eventId)) {
    return state
  }

  const nextState: ChatState = {
    ...state,
    seenEventIds: [...state.seenEventIds, event.eventId],
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
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: [...message.chunks, event.chunk].sort((left, right) => left.order - right.order),
      }))
    case 'chunk_patched':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        updatedAt: event.timestamp,
        chunks: message.chunks.map((chunk) => patchChunk(chunk, event.chunkId, event.patch)),
      }))
    case 'message_completed':
      return updateMessage(nextState, event.messageId, (message) => ({
        ...message,
        status: 'completed',
        updatedAt: event.timestamp,
      }))
    case 'message_failed':
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

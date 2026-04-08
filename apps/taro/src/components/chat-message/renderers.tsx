import { Image, Text, View } from '@tarojs/components'
import type { MessageChunk } from './types'

export function ChatChunkRenderer({ chunk }: { chunk: MessageChunk }) {
  switch (chunk.type) {
    case 'text':
      return <Text className="chat-message__text">{chunk.text}</Text>
    case 'markdown':
      return <Text className="chat-message__markdown">{chunk.text}</Text>
    case 'image':
      return (
        <View className="chat-message__image-wrap">
          <Image className="chat-message__image" src={chunk.url} mode="widthFix" />
          {chunk.alt ? <Text className="chat-message__image-alt">{chunk.alt}</Text> : null}
        </View>
      )
    case 'form':
      return (
        <View className="chat-message__form">
          {chunk.title ? <Text className="chat-message__form-title">{chunk.title}</Text> : null}
          {chunk.fields.map((field) => (
            <View key={field.name} className="chat-message__form-field">
              <Text className="chat-message__form-label">{field.label}</Text>
              <View className="chat-message__form-control">
                <Text className="chat-message__form-placeholder">{field.placeholder ?? ''}</Text>
              </View>
            </View>
          ))}
          <View className="chat-message__form-submit">
            <Text className="chat-message__form-submit-text">{chunk.submitLabel ?? '提交'}</Text>
          </View>
        </View>
      )
    case 'card':
      return (
        <View className="chat-message__card">
          <Text className="chat-message__card-title">{chunk.title}</Text>
          {chunk.description ? <Text className="chat-message__card-desc">{chunk.description}</Text> : null}
        </View>
      )
    case 'status':
      return <Text className={`chat-message__status chat-message__status--${chunk.tone}`}>{chunk.text}</Text>
  }
}
